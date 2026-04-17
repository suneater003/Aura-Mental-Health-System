import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useMindfulTracker } from '../hooks/useMindfulTracker';

const ColourTherapy = ({ isDarkMode, onExit }) => {
  useMindfulTracker('ColourTherapy');
  const [mood, setMood] = useState('calm');
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);

  const moods = {
    calm: {
      name: "Calming",
      desc: "Cool blues and greens to lower heart rate and soothe the mind.",
      gradient: "from-blue-400 via-teal-300 to-emerald-400",
      darkGradient: "from-blue-900 via-teal-900 to-emerald-900",
      rippleColor: "bg-white/30"
    },
    energize: {
      name: "Energizing",
      desc: "Warm tones to uplift and awaken your senses.",
      gradient: "from-orange-400 via-amber-300 to-yellow-400",
      darkGradient: "from-orange-900 via-amber-900 to-yellow-900",
      rippleColor: "bg-white/40"
    },
    ground: {
      name: "Grounding",
      desc: "Earthy tones to bring you back to the present moment.",
      gradient: "from-stone-500 via-amber-600 to-orange-800",
      darkGradient: "from-stone-900 via-amber-950 to-orange-950",
      rippleColor: "bg-amber-200/20"
    },
    focus: {
      name: "Focus",
      desc: "Deep violets and indigos for clarity and concentration.",
      gradient: "from-indigo-500 via-purple-500 to-fuchsia-500",
      darkGradient: "from-indigo-950 via-purple-900 to-fuchsia-900",
      rippleColor: "bg-indigo-300/30"
    }
  };

  const handlePointerDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: Math.random() * 20 + 20 // Reduced brush size to 20-40px
    };

    setRipples(prev => [...prev, newRipple]);

    // Clean up ripples after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 4000);
  };

  const activeMood = moods[mood];
  const bgClass = isDarkMode ? activeMood.darkGradient : activeMood.gradient;

  return createPortal(
    <div className={`fixed inset-0 z-[500] flex flex-col p-4 backdrop-blur-xl ${isDarkMode ? 'bg-black/90' : 'bg-[#FFFBF0]/90'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <button 
          onClick={onExit}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            isDarkMode 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
              : 'bg-[#FFFBF0] text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          Colour Therapy
        </h2>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Mood Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(moods).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setMood(key)}
            className={`p-3 rounded-2xl font-bold transition-all text-sm flex flex-col items-center gap-1 ${
              mood === key 
                ? isDarkMode 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                  : 'bg-sky-100 text-sky-700 border border-sky-300 shadow-sm'
                : isDarkMode
                  ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                  : 'bg-[#FFFBF0]/60 text-slate-500 hover:bg-[#FFFBF0] hover:text-slate-800 shadow-sm border border-transparent'
            }`}
          >
            <span>{m.name}</span>
          </button>
        ))}
      </div>

      <div className="text-center mb-6">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {activeMood.desc}
        </p>
        <p className={`text-xs mt-2 opacity-70 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Tap or drag across the canvas below to paint with calming energy.
        </p>
      </div>

      {/* Interactive Canvas Grid */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => {
          if (e.buttons > 0) handlePointerDown(e); // Only spawn if dragging
        }}
        className={`flex-1 w-full h-full rounded-[2.5rem] overflow-hidden relative cursor-crosshair touch-none transition-colors duration-1000 bg-gradient-to-br shadow-2xl ${bgClass}`}
        style={{ touchAction: 'none' }}
      >
        {/* Ambient slow breathing pulse background */}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent animate-[pulse_4s_ease-in-out_infinite]"></div>
        
        {/* Ripples */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className={`absolute rounded-full pointer-events-none animate-[ping_4s_ease-out_forwards] ${activeMood.rippleColor}`}
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}

        <div className="absolute bottom-6 w-full text-center pointer-events-none">
          <span className="px-4 py-2 rounded-full bg-black/20 backdrop-blur-md text-white/80 text-xs font-bold uppercase tracking-widest shadow-xl border border-[#FFFBF0]/10">
            Interactive Canvas
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ColourTherapy;
