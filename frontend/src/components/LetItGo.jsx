import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Leaf, ArrowLeft, Droplets, Wind } from 'lucide-react';
import { useMindfulTracker } from '../hooks/useMindfulTracker';

const LetItGo = ({ isDarkMode, onExit }) => {
  useMindfulTracker('LetItGo');
  const [thought, setThought] = useState('');
  const [items, setItems] = useState([]); // { id, text, type: 'leaf' | 'stone', status: 'idle' | 'released' }
  const [type, setType] = useState('leaf'); // 'leaf' or 'stone'

  const handleCreate = (e) => {
    e.preventDefault();
    if (!thought.trim()) return;
    
    setItems(prev => [...prev, {
      id: Date.now(),
      text: thought,
      type,
      status: 'idle',
      x: Math.random() * 40 + 30 // 30% to 70%
    }]);
    setThought('');
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('itemId', id.toString());
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('itemId'));
    if (!id) return;
    
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'released' } : item
    ));

    // Remove item after animation completes
    setTimeout(() => {
      setItems(prev => prev.filter(item => item.id !== id));
    }, 8000); // 8 seconds for the float away animation
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // allow drop
  };

  return createPortal(
    <div className={`fixed inset-0 z-[500] flex flex-col p-4 md:p-8 backdrop-blur-xl overflow-hidden shadow-2xl ${
      isDarkMode ? 'bg-slate-950/95 text-white' : 'bg-sky-50/95 text-slate-800'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center z-20 pb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Let It Go</h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Type a heavy thought, turn it into a leaf or stone, and release it into the river.
          </p>
        </div>
        <button 
          onClick={onExit}
          className={`px-4 py-2 rounded-xl text-sm font-semibold shadow transition-all active:scale-95 ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          Exit Game
        </button>
      </div>

      <div className="mt-4 z-20 w-full max-w-lg mx-auto flex flex-col px-6">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="What is weighing heavily on your mind?"
            rows={2}
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none transition-all ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/50' 
                : 'bg-[#FFFBF0] border-slate-200 focus:border-emerald-400/50 focus:ring-emerald-400/50'
            }`}
          />
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('leaf')}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  type === 'leaf' 
                    ? (isDarkMode ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/50' : 'bg-emerald-100 text-emerald-700 border border-emerald-300')
                    : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                }`}
              >
                <Leaf size={16} /> Leaf
              </button>
              <button
                type="button"
                onClick={() => setType('stone')}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  type === 'stone' 
                    ? (isDarkMode ? 'bg-stone-800 text-stone-300 border border-stone-500/50' : 'bg-stone-200 text-stone-700 border border-stone-400')
                    : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                }`}
              >
                <Droplets size={16} /> Stone
              </button>
            </div>
            <button 
              type="submit"
              disabled={!thought.trim()}
              className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transform active:scale-95 transition-all text-white disabled:opacity-50 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300'
              }`}
            >
              Manifest
            </button>
          </div>
        </form>

        {/* Current Items to Drag */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center min-h-[100px]">
          {items.filter(item => item.status === 'idle').length === 0 && (
             <p className={`text-center w-full text-sm mt-4 opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               Manifest a thought to drag it to the river...
             </p>
          )}
          {items.filter(item => item.status === 'idle').map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className={`cursor-grab active:cursor-grabbing p-4 w-40 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:scale-105 border ${
                item.type === 'leaf' 
                  ? `[border-radius:0_50%_0_50%] ${isDarkMode ? 'bg-emerald-900/40 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`
                  : `[border-radius:40%_60%_70%_30%/40%_50%_60%_50%] ${isDarkMode ? 'bg-stone-800 border-stone-600' : 'bg-stone-100 border-stone-300'}`
              }`}
            >
              {item.type === 'leaf' 
                ? <Leaf className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} size={24} /> 
                : <Droplets className={isDarkMode ? 'text-stone-400' : 'text-stone-600'} size={24} />
              }
              <span className={`text-xs mt-2 font-medium line-clamp-3 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* River Area */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`absolute bottom-0 left-0 w-full h-[40%] flex flex-col items-center justify-center border-t-2 border-dashed transition-all z-0 overflow-hidden ${
          isDarkMode ? 'border-blue-500/30 bg-blue-950/40' : 'border-blue-300 bg-blue-50/50'
        }`}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Animated river waves */}
          <div className="absolute top-1/4 -left-1/4 w-[150%] h-4 rounded-full bg-blue-400 blur-xl animate-[flow_8s_linear_infinite]"></div>
          <div className="absolute top-2/4 -left-1/4 w-[150%] h-6 rounded-full bg-cyan-400 blur-xl animate-[flow_12s_linear_infinite_reverse]"></div>
          <div className="absolute top-3/4 -left-1/4 w-[150%] h-8 rounded-full bg-sky-500 blur-xl animate-[flow_10s_linear_infinite]"></div>
        </div>
        
        <p className={`relative z-10 font-bold tracking-widest uppercase opacity-50 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
          <Wind className="inline mr-2 animate-pulse" size={18} />
          Drag here to let it go
        </p>

        {/* Released Items Flowing */}
        {items.filter(item => item.status === 'released').map(item => (
          <div
            key={item.id}
            className={`absolute top-1/2 -translate-y-1/2 opacity-0 pointer-events-none ${
              item.type === 'leaf' ? 'animate-[floatAwayLeaf_8s_ease-out_forwards]' : 'animate-[sinkStone_4s_ease-in_forwards]'
            }`}
            style={{ left: `${item.x}%` }}
          >
            <div className={`p-3 w-32 flex flex-col items-center text-center shadow-sm border ${
              item.type === 'leaf' 
                ? `[border-radius:0_50%_0_50%] ${isDarkMode ? 'bg-emerald-900/60 border-emerald-500/30' : 'bg-emerald-100 border-emerald-200'}`
                : `[border-radius:40%_60%_70%_30%/40%_50%_60%_50%] ${isDarkMode ? 'bg-stone-800 border-stone-600' : 'bg-stone-200 border-stone-300'}`
            }`}>
              {item.type === 'leaf' 
                ? <Leaf className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} size={20} /> 
                : <Droplets className={isDarkMode ? 'text-stone-400' : 'text-stone-600'} size={20} />
              }
              <span className={`text-[10px] mt-1 font-medium line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.text}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(50px); }
        }
        @keyframes floatAwayLeaf {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          20% { transform: translate(50px, -20px) rotate(15deg) scale(0.9); opacity: 0.8; }
          40% { transform: translate(100px, 10px) rotate(-10deg) scale(0.8); opacity: 0.6; }
          60% { transform: translate(150px, -15px) rotate(20deg) scale(0.7); opacity: 0.4; }
          100% { transform: translate(300px, 0px) rotate(45deg) scale(0.5); opacity: 0; }
        }
        @keyframes sinkStone {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          20% { transform: translateY(20px) scale(0.9); opacity: 0.8; }
          100% { transform: translateY(150px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default LetItGo;