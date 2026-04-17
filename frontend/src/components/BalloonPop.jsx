import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Target, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';
import { useMindfulTracker } from '../hooks/useMindfulTracker';

const BalloonPop = ({ isDarkMode, onExit }) => {
  useMindfulTracker('BalloonPop');
  const [phase, setPhase] = useState('input'); // 'input' | 'floating'
  const [balloons, setBalloons] = useState([]);
  const [worry, setWorry] = useState('');
  const [poppedCount, setPoppedCount] = useState(0);

  const colors = [
    'from-red-500 to-rose-400',
    'from-orange-500 to-amber-400',
    'from-purple-500 to-fuchsia-400',
    'from-sky-500 to-blue-400',
    'from-emerald-500 to-green-400'
  ];

  const shapes = ['oval', 'heart', 'square', 'triangle'];

  const persistProgress = async (count) => {
    try {
      const token = localStorage.getItem('aura_token');
      if (token) {
        await axios.post('http://localhost:5000/api/games/progress/stress-balloon-pop', 
          { level: Math.floor(count / 5) + 1, score: count * 10, unlockedFeatures: ['Worry Free'] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.log('Progress not saved', err);
    }
  };

  const handleAddWorry = (e) => {
    e.preventDefault();
    if (!worry.trim()) return;
    
    const newBalloon = {
      id: Date.now(),
      text: worry,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      left: Math.random() * 60 + 20, 
      animationDuration: Math.random() * 5 + 10,
    };
    
    setBalloons((prev) => [...prev, newBalloon]);
    setWorry('');
  };

  const handleRemoveWorryInput = (id) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  };

  const handlePop = (id) => {
    if (phase !== 'floating') return; 
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    setPoppedCount((prev) => {
      const newCount = prev + 1;
      if (newCount % 5 === 0) persistProgress(newCount); 
      return newCount;
    });
  };

  const startFloating = () => {
    if (balloons.length > 0) setPhase('floating');
  };

  const resetGame = () => {
    setBalloons([]);
    setPhase('input');
  };

  const getShapeClasses = (shape) => {
    switch (shape) {
      case 'square': return 'rounded-3xl';
      case 'triangle': return '[clip-path:polygon(50%_0%,_0%_100%,_100%_100%)]';
      case 'heart': return '[clip-path:polygon(50%_20%,_80%_0%,_100%_25%,_100%_50%,_50%_100%,_0%_50%,_0%_25%,_20%_0%)]';
      case 'oval':
      default: return 'rounded-t-[50%] rounded-b-[45%]';
    }
  };

  const gameContent = (
    <div className={
      phase === 'floating' 
        ? `fixed inset-0 z-[500] flex flex-col p-6 md:p-12 backdrop-blur-3xl ${isDarkMode ? 'bg-slate-950/95 text-white' : 'bg-sky-50/95 text-slate-800'}`
        : `h-full flex flex-col p-6 md:p-8 rounded-[2rem] border backdrop-blur-md relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700 text-white' : 'bg-[#FFFBF0]/80 border-slate-200 text-slate-800'}`
    }>
      <div className="flex justify-between items-center z-10 p-4 pb-0">
        <div>
          <h2 className="text-2xl font-bold mb-1">Stress Balloon Pop</h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Type your worries, let them float, and pop them away!
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

      {phase === 'input' && (
        <div className="mt-8 z-10 w-full max-w-md mx-auto flex flex-col flex-1 pb-4">
          <form onSubmit={handleAddWorry} className="flex gap-2">
            <input
              type="text"
              value={worry}
              onChange={(e) => setWorry(e.target.value)}
              placeholder="What's bothering you right now?"
              className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700 focus:border-red-500/50 focus:ring-red-500/50' 
                  : 'bg-[#FFFBF0] border-slate-200 focus:border-red-400/50 focus:ring-red-400/50'
              }`}
            />
            <button 
              type="submit"
              disabled={!worry.trim()}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transform active:scale-95 transition-all text-white ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 opacity-90 disabled:opacity-50' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 hover:to-indigo-300 disabled:opacity-50'
              }`}
            >
              Add
            </button>
          </form>

          {balloons.length > 0 && (
            <div className="mt-8 flex-1 overflow-y-auto">
               <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Ready to Release:</h3>
               <ul className="space-y-3 mb-6">
                 {balloons.map((b) => (
                   <li key={b.id} className={`flex items-center justify-between p-3 rounded-xl backdrop-blur-sm border ${
                     isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'
                   }`}>
                     <span className="text-sm font-medium pr-4 break-words line-clamp-2">{b.text}</span>
                     <button onClick={() => handleRemoveWorryInput(b.id)} className={`p-1.5 rounded-full hover:bg-red-500/20 text-red-500 transition-colors`}>
                        <X size={16} />
                     </button>
                   </li>
                 ))}
               </ul>
            </div>
          )}

          {balloons.length > 0 && (
            <div className="pt-4 mt-auto">
              <button 
                onClick={startFloating}
                className="w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-red-500/20 transform active:scale-95 transition-all text-white bg-gradient-to-r from-red-500 to-rose-400 hover:from-red-400 hover:to-rose-300"
              >
                Let Them Float <Target size={20} className="inline ml-2" />
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'floating' && (
        <div className="flex-1 relative z-0 flex flex-col h-full w-full pointer-events-none pb-4">
          {poppedCount > 0 && (
            <div className={`mt-4 text-center z-10 text-sm font-semibold flex items-center justify-center gap-2 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              <CheckCircle2 size={16} /> You've let go of {poppedCount} {poppedCount === 1 ? 'worry' : 'worries'}.
            </div>
          )}

          <div className="flex-1 relative w-full h-full pointer-events-auto">
            {balloons.length === 0 && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">All Clear!</h3>
                <p className="mb-8 opacity-80">You popped every single worry away. Great job.</p>
                <button 
                  onClick={resetGame}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-400 shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Start Over
                </button>
              </div>
            )}
            
            {balloons.map((balloon) => (
              <div
                key={balloon.id}
                onClick={() => handlePop(balloon.id)}
                className={`absolute bottom-10 flex flex-col items-center justify-center w-28 h-32 cursor-pointer animate-[floatUp_15s_linear_infinite] transition-all hover:scale-110 active:scale-90`}
                style={{ 
                  left: `${balloon.left}%`,
                  animationDuration: `${balloon.animationDuration}s`,
                  animationDelay: '0.1s' 
                }}
              >
                <div 
                   className={`absolute inset-0 w-full h-full bg-gradient-to-br ${balloon.color} ${getShapeClasses(balloon.shape)} shadow-lg pointer-events-auto`} 
                   style={{ boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.2)' }}
                >
                  <div className="absolute top-3 left-4 w-6 h-10 rounded-full bg-[#FFFBF0]/30 rotate-[30deg]"></div>
                </div>

                <div className="relative text-white font-bold text-center px-2 text-[10px] leading-tight drop-shadow-md break-words z-20 pointer-events-none">
                  {balloon.text}
                </div>

                <div className={`absolute -bottom-2 z-10 w-3 h-3 rotate-45 bg-gradient-to-br ${balloon.color}`}></div>
                <div className="absolute -bottom-16 z-0 w-[1.5px] h-16 bg-[#FFFBF0]/40"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes floatUp {
          0% { transform: translateY(100px) rotate(-5deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(-200px) rotate(5deg); }
          90% { opacity: 1; }
          100% { transform: translateY(-400px) rotate(-5deg); opacity: 0; }
        }
      `}</style>
    </div>
  );

  return phase === 'floating' ? createPortal(gameContent, document.body) : gameContent;
};

export default BalloonPop;