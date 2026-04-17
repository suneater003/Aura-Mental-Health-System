import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flame, X, CheckCircle } from 'lucide-react';
import { useMindfulTracker } from '../hooks/useMindfulTracker';

const BurnTheWorries = ({ isDarkMode, onExit }) => {
  useMindfulTracker('BurnTheWorries');
  const [worryText, setWorryText] = useState('');
  const [phase, setPhase] = useState('writing'); // reading/writing, crumpling, burning, burned

  const handleBurn = () => {
    if (!worryText.trim()) return;
    setPhase('crumpling');
    
    setTimeout(() => {
      setPhase('burning');
      setTimeout(() => {
        setPhase('burned');
      }, 5000); // 5s burning animation
    }, 1500); // 1.5s crumpling animation
  };

  const handleReset = () => {
    setWorryText('');
    setPhase('writing');
  };

  return createPortal(
    <div className={`fixed inset-0 z-[500] flex flex-col p-4 md:p-8 backdrop-blur-xl overflow-y-auto custom-scrollbar shadow-2xl ${
      isDarkMode ? 'bg-slate-950/95 text-white' : 'bg-red-50/95 text-slate-800'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center z-20 pb-4 border-b border-red-500/20">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flame className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
            Burn The Worries
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Type your deepest anxieties here, then watch them turn to ash.
          </p>
        </div>
        <button 
          onClick={onExit}
          className={`px-4 py-2 rounded-xl text-sm font-semibold shadow transition-all active:scale-95 flex items-center gap-2 ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-[#FFFBF0] hover:bg-slate-100'
          }`}
        >
          <X size={16} /> Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full mt-8 gap-8 relative">
        
        {/* The Paper */}
        {(phase === 'writing' || phase === 'crumpling' || phase === 'burning') && (
          <div className="relative w-full max-w-lg mb-8">
             <div className={`w-full min-h-[300px] p-8 shadow-2xl relative overflow-hidden ${
               isDarkMode ? 'bg-amber-100/90 text-amber-900 border-amber-200' : 'bg-[#fdfbf7] text-slate-800 border-[#eae6df] shadow-orange-900/10'
             } ${phase === 'crumpling' || phase === 'burning' ? 'crumpled-paper' : ''} ${phase === 'burning' ? 'burning-paper' : ''}`}>

                {/* Lines on paper */}
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #1e293b 31px, #1e293b 32px)', marginTop: '40px' }}></div>
                
                {/* Red margin line */}
                <div className="absolute top-0 bottom-0 left-[10%] w-[1px] bg-red-400/40 pointer-events-none"></div>

                <textarea
                  value={worryText}
                  onChange={(e) => setWorryText(e.target.value)}
                  disabled={phase === 'burning'}
                  placeholder="I am worried about..."
                  className="w-full h-full min-h-[250px] bg-transparent resize-none focus:outline-none pl-[12%] py-2 leading-[32px] text-lg relative z-20"
                  style={{ fontFamily: "'Indie Flower', 'Comic Sans MS', cursive" }}
                />
             </div>

             {/* External Smoke & Embers that float UP over the burning paper */}
             {phase === 'burning' && (
               <div className="absolute inset-0 pointer-events-none z-50">
                 {[...Array(12)].map((_, i) => (
                   <div 
                     key={`smoke-${i}`} 
                     className="absolute bg-gray-500/40 rounded-full blur-xl animate-[smokeRise_4s_ease-out_forwards]"
                     style={{
                       left: `${20 + Math.random() * 60}%`,
                       bottom: `${10 + Math.random() * 30}%`,
                       width: `${60 + Math.random() * 80}px`,
                       height: `${60 + Math.random() * 80}px`,
                       animationDelay: `${Math.random() * 2}s`
                     }}
                   ></div>
                 ))}
                 {[...Array(30)].map((_, i) => (
                   <div 
                     key={`ember-${i}`} 
                     className={`absolute bg-orange-400 rounded-full blur-[1px] animate-[emberFly${(i % 3) + 1}_3s_ease-out_forwards]`}
                     style={{
                       left: `${10 + Math.random() * 80}%`,
                       bottom: `${10 + Math.random() * 50}%`,
                       width: `${3 + Math.random() * 5}px`,
                       height: `${3 + Math.random() * 5}px`,
                       animationDelay: `${Math.random() * 3}s`
                     }}
                   ></div>
                 ))}
               </div>
             )}

             {/* Burn Button */}
             {phase === 'writing' && worryText.trim() && (
                <div className="absolute -bottom-6 right-4 lg:-right-8 animate-in slide-in-from-bottom-2 zoom-in fade-in duration-300">
                  <button
                    onClick={handleBurn}
                    className="p-4 rounded-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold shadow-[0_0_20px_rgba(239,68,68,0.5)] transform hover:scale-110 active:scale-95 transition-all group"
                  >
                    <Flame size={32} className="group-hover:animate-pulse" />
                  </button>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-red-500 opacity-80 uppercase tracking-widest">
                    Burn It
                  </div>
                </div>
             )}
          </div>
        )}

        {/* Burned State (Ash) */}
        {phase === 'burned' && (
           <div className="flex flex-col items-center animate-[ashFade_2s_ease-in_forwards]">
              <div className="w-64 h-32 relative mb-8">
                 {/* Ash particles */}
                 <div className="absolute inset-0 flex flex-wrap justify-center content-center gap-2 opacity-50 blur-[1px]">
                   {[...Array(20)].map((_, i) => (
                     <div key={i} className="w-3 h-3 bg-stone-800 rounded-full rotate-45 transform" style={{ opacity: Math.random() }}></div>
                   ))}
                 </div>
              </div>
              <h3 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                It's gone.
                <br/><span className="text-lg font-normal opacity-80">Your worry has turned to ash.</span>
              </h3>
              <CheckCircle size={64} className="text-stone-500 mb-8 opacity-50" />
              <button 
                onClick={handleReset}
                className="px-8 py-3 rounded-xl border-2 font-bold text-lg shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-slate-500 text-slate-500"
              >
                Write Another
              </button>
           </div>
        )}

      </div>
      <style jsx>{`
        .crumpled-paper {
           animation: crumple 1.5s forwards ease-in-out;
        }

        .burning-paper {
           animation: maskSweep 5s forwards linear;
           -webkit-mask-image: linear-gradient(
             to top left,
             transparent 0%,
             transparent 40%,
             black 55%,
             black 100%
           );
           -webkit-mask-size: 250% 250%;
           -webkit-mask-position: 0% 0%;
        }

        .burning-paper::after {
           content: '';
           position: absolute;
           inset: 0;
           background: linear-gradient(
             to top left,
             transparent 0%,
             transparent 40%,
             #1c1917 48%,
             #7f1d1d 50%,
             #ea580c 52%,
             #facc15 54%,
             transparent 55%,
             transparent 100%
           );
           background-size: 250% 250%;
           background-position: 0% 0%;
           animation: burnSweep 5s forwards linear;
           z-index: 40;
           mix-blend-mode: multiply;
           pointer-events: none;
        }

        @keyframes crumple {
           0% { transform: scale(1) rotate(0deg); border-radius: 0; }
           50% { transform: scale(0.98) rotate(1deg); border-radius: 4px 10px 3px 15px; box-shadow: inset 0 0 20px rgba(0,0,0,0.1); }
           100% { transform: scale(0.96) rotate(-2deg); border-radius: 8px 15px 6px 20px; box-shadow: inset 0 0 40px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.2); }
        }

        @keyframes burnSweep {
           0% { background-position: 0% 0%; }
           100% { background-position: 100% 100%; }
        }
        @keyframes maskSweep {
           0% { -webkit-mask-position: 0% 0%; }
           100% { -webkit-mask-position: 100% 100%; }
        }
        @keyframes smokeRise {
           0% { transform: translateY(0) scale(1); opacity: 0; }
           15% { opacity: 0.8; }
           100% { transform: translateY(-450px) scale(3.5); opacity: 0; }
        }
        @keyframes emberFly1 {
           0% { transform: translate(0, 0) scale(1); opacity: 1; }
           100% { transform: translate(-100px, -250px) scale(0); opacity: 0; }
        }
        @keyframes emberFly2 {
           0% { transform: translate(0, 0) scale(1); opacity: 1; }
           100% { transform: translate(80px, -300px) scale(0); opacity: 0; }
        }
        @keyframes emberFly3 {
           0% { transform: translate(0, 0) scale(1); opacity: 1; }
           100% { transform: translate(-60px, -280px) scale(0); opacity: 0; }
        }
        @keyframes ashFade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default BurnTheWorries;