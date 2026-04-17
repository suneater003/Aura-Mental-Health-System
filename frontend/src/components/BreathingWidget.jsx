import React, { useState, useEffect } from 'react';
import { Wind, ArrowLeft } from 'lucide-react';
import { useMindfulTracker } from '../hooks/useMindfulTracker';

const BreathingWidget = ({ isDarkMode, onExit, fullScreen = false }) => {
  useMindfulTracker('BreathingWidget');
  const [phase, setPhase] = useState(0); // 0: Inhale, 1: Hold, 2: Exhale, 3: Hold
  const [isActive, setIsActive] = useState(false);

  const phases = [
    { text: "Breathe In", instruction: "Fill your lungs slowly...", color: "from-sky-300 to-blue-500", shadow: "shadow-blue-500/40", scale: "scale-150" },
    { text: "Hold", instruction: "Keep it in gently...", color: "from-pink-300 to-rose-400", shadow: "shadow-rose-400/40", scale: "scale-150" },
    { text: "Breathe Out", instruction: "Release slowly...", color: "from-purple-300 to-violet-500", shadow: "shadow-violet-500/40", scale: "scale-90" },
    { text: "Hold", instruction: "Wait for the next breath...", color: "from-slate-300 to-slate-400", shadow: "shadow-slate-400/20", scale: "scale-90" },
  ];

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setPhase((prev) => (prev + 1) % 4);
      }, 4000); // 4 seconds per phase (Box Breathing)
    } else {
      setPhase(0);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const activePhase = phases[phase];

  // Full Screen Mode Render (for Dashboard routing)
  if (fullScreen) {
    return (
      <div className="h-full flex flex-col pt-2 pb-8">
        <div className="flex items-center justify-between mb-8 z-10 w-full px-4">
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
          <div className={`p-2 rounded-xl backdrop-blur-md border ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#FFFBF0]/50 border-slate-200'
          }`}>
            <Wind size={24} className={isDarkMode ? 'text-sky-400' : 'text-sky-600'} />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <h2 className={`text-3xl font-black mb-12 text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Meditation Quest</h2>
          
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-16">
            {/* The Breathing Circle/Box */}
            <div 
              className={`absolute inset-0 rounded-[3rem] transition-all duration-[4000ms] ease-in-out shadow-2xl bg-gradient-to-br ${
                isActive ? `${activePhase.color} ${activePhase.shadow} ${activePhase.scale}` : (isDarkMode ? 'from-slate-700 to-slate-800 scale-100 shadow-slate-900/50' : 'from-sky-100 to-blue-50 scale-100 shadow-blue-100/50')
              }`}
            ></div>
            {/* Inner Ring */}
            <div className={`absolute inset-4 rounded-[2.5rem] border-4 transition-all duration-1000 ${
              isActive ? 'border-white/30' : (isDarkMode ? 'border-slate-600/50' : 'border-sky-200')
            }`}></div>
            
            <div className="relative z-10 text-center flex flex-col items-center">
              {isActive ? (
                <>
                   <p className="text-3xl font-black text-white drop-shadow-md tracking-wider uppercase mb-2">
                     {activePhase.text}
                   </p>
                   <p className="text-sm font-medium text-white/90 drop-shadow">
                     {activePhase.instruction}
                   </p>
                </>
              ) : (
                <div className={`flex flex-col items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <p className="font-bold mb-1">4-4-4-4 Box Breathing</p>
                  <p className="text-xs max-w-[150px] text-center">Click start to center yourself.</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setIsActive(!isActive)}
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl ${
              isActive 
                ? isDarkMode ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : isDarkMode ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-orange-900/50' : 'bg-sky-600 text-white hover:bg-sky-500 shadow-sky-200'
            }`}
          >
            {isActive ? "End Journey" : "Begin Journey"}
          </button>
        </div>
      </div>
    );
  }

  // Modal/Overlay Mode (for Crisis situations)
  if (!fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
        <div className={`rounded-3xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto ${
          isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-[#FFFBF0] border border-slate-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Take a Breath
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Let's center yourself
              </p>
            </div>
            <button
              onClick={onExit}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
              }`}
            >
              ✕
            </button>
          </div>

          {/* Breathing Circle */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-60 h-60 flex items-center justify-center mb-12">
              {/* The Breathing Circle */}
              <div 
                className={`absolute inset-0 rounded-full transition-all duration-[4000ms] ease-in-out shadow-2xl bg-gradient-to-br ${
                  isActive ? `${activePhase.color} ${activePhase.shadow} ${activePhase.scale}` : (isDarkMode ? 'from-slate-700 to-slate-800 scale-100 shadow-slate-900/50' : 'from-sky-100 to-blue-50 scale-100 shadow-blue-100/50')
                }`}
              ></div>
              {/* Inner Ring */}
              <div className={`absolute inset-4 rounded-full border-4 transition-all duration-1000 ${
                isActive ? 'border-[#FFFBF0]/30' : (isDarkMode ? 'border-slate-600/50' : 'border-sky-200')
              }`}></div>
              
              <div className="relative z-10 text-center flex flex-col items-center">
                {isActive ? (
                  <>
                     <p className="text-2xl font-black text-white drop-shadow-md tracking-wider uppercase mb-2">
                       {activePhase.text}
                     </p>
                     <p className="text-sm font-medium text-white/90 drop-shadow">
                       {activePhase.instruction}
                     </p>
                  </>
                ) : (
                  <div className={`flex flex-col items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Wind size={32} className="mb-2" />
                    <p className="font-bold mb-1">4-4-4-4 Box Breathing</p>
                    <p className="text-xs max-w-[150px] text-center">Click start when ready</p>
                  </div>
                )}
              </div>
            </div>

            {/* Button */}
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 mb-4 ${
                isActive 
                  ? isDarkMode ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : isDarkMode ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/30' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-400/30'
              }`}
            >
              {isActive ? "End Session" : "Begin Breathing"}
            </button>

            <button
              onClick={onExit}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Return empty or a small widget version if not fullScreen
  return null;
};

export default BreathingWidget;