import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sprout, Flower2, Trees, Leaf, Droplets, RefreshCw, X, Sun, CloudRain } from 'lucide-react';
import { useMindfulTracker } from '../hooks/useMindfulTracker';

const MindGarden = ({ isDarkMode, onExit }) => {
  useMindfulTracker('MindGarden');
  const [level, setLevel] = useState(1);
  const [stage, setStage] = useState(0); // 0: seed, 1: sprout, 2: leaves, 3: tree, 4: bloom
  const [gridSize, setGridSize] = useState(3);
  const [sequenceLength, setSequenceLength] = useState(4);
  
  const [tiles, setTiles] = useState([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, failed
  const [clickedTiles, setClickedTiles] = useState([]);
  const [message, setMessage] = useState("Plant a seed of positivity and water it to grow.");

  const generatePuzzle = useCallback(() => {
    const totalTiles = gridSize * gridSize;
    const positions = Array.from({ length: totalTiles }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    const selectedPositions = positions.slice(0, sequenceLength);
    const newTiles = Array.from({ length: totalTiles }, () => null);
    selectedPositions.forEach((pos, index) => {
      newTiles[pos] = index + 1;
    });
    
    setTiles(newTiles);
    setNextExpected(1);
    setClickedTiles([]);
    setGameState('playing');
    setMessage(`Tap the numbers in sequence from 1 to ${sequenceLength} to water the plant!`);
  }, [gridSize, sequenceLength]);

  const handleTileClick = (index) => {
    if (gameState !== 'playing') return;
    
    const tileNumber = tiles[index];
    if (!tileNumber) return; 
    if (clickedTiles.includes(index)) return;
    
    if (tileNumber === nextExpected) {
      setClickedTiles(prev => [...prev, index]);
      
      if (nextExpected === sequenceLength) {
        setGameState('won');
        setMessage("Perfect! The water is nourishing the plant...");
        
        setTimeout(() => {
          setStage(prev => {
            if (prev >= 4) return 0; // Restart cycle if fully bloomed
            return prev + 1;
          });
          
          setLevel(prev => prev + 1);
          // Increase difficulty
          setSequenceLength(prev => prev + 1);
          // If the sequence gets too dense for the grid, expand the grid
          if (sequenceLength + 1 > Math.floor((gridSize * gridSize) * 0.6) && gridSize < 6) {
             setGridSize(grid => grid + 1);
          }
          
          setGameState('idle');
          if (stage === 4) {
             setMessage("Beautiful bloom! A new seed has been planted automatically.");
             setLevel(1);
             setGridSize(3);
             setSequenceLength(4);
          } else {
             setMessage("Ready for the next watering phase?");
          }
        }, 1500);
      } else {
        setNextExpected(prev => prev + 1);
      }
    } else if (tileNumber > nextExpected) {
      setGameState('failed');
      setClickedTiles(prev => [...prev, index]);
      setMessage("Oops! You crossed the stream. The plant needs clear sequence.");
      setTimeout(() => {
        setGameState('idle');
        setMessage("Take a breath and try again.");
      }, 2000);
    }
  };

  const renderPlant = () => {
    switch (stage) {
      case 0: 
        return (
          <div className="relative h-32 flex items-end justify-center">
            <div className={`w-8 h-5 rounded-[40%_60%] shadow-inner ${isDarkMode ? 'bg-amber-800' : 'bg-amber-700'}`} />
            <div className="absolute -bottom-4 w-32 h-4 bg-black/20 blur-md rounded-[50%]" />
          </div>
        );
      case 1: 
        return <Sprout size={100} className="text-emerald-500 animate-[bounce_3s_ease-in-out_infinite]" />;
      case 2: 
        return <Leaf size={120} className="text-emerald-500 animate-[pulse_4s_infinite]" />;
      case 3: 
        return <Trees size={140} className="text-green-600 animate-[pulse_5s_infinite]" />;
      case 4: 
        return <Flower2 size={160} className="text-pink-500 animate-[bounce_4s_ease-in-out_infinite]" />;
      default: 
        return <Sprout size={100} className="text-emerald-500" />;
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-[500] flex flex-col md:flex-row backdrop-blur-xl overflow-hidden shadow-2xl ${
      isDarkMode ? 'bg-slate-950/95 text-white' : 'bg-green-50/95 text-slate-800'
    }`}>
       {/* Left side - Garden Visuals */}
       <div className={`w-full md:w-1/2 flex flex-col pt-8 px-8 pb-4 border-b md:border-b-0 md:border-r ${
         isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-green-200 bg-green-100/30'
       }`}>
           <div className="flex justify-between items-start mb-6">
              <div>
                 <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                   <Sprout className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} /> 
                   Mind Garden
                 </h2>
                 <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                   Focus your mind to nature. Complete sequence paths to grow your plant.
                 </p>
              </div>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Sun/Cloud styling */}
              <div className="absolute top-10 right-10">
                 {gameState === 'playing' ? (
                   <CloudRain size={64} className="text-sky-400 animate-pulse opacity-80" />
                 ) : (
                   <Sun size={64} className="text-yellow-400 animate-[spin_10s_linear_infinite] opacity-80" />
                 )}
              </div>

              <div className={`p-12 mt-16 rounded-full relative transition-all duration-1000 ${
                 gameState === 'won' ? 'bg-green-500/20 scale-110' : 
                 gameState === 'failed' ? 'bg-red-500/10 scale-95' : 'bg-transparent scale-100'
              }`}>
                 {renderPlant()}
              </div>
              <div className={`mt-8 px-6 py-3 rounded-2xl border text-center font-semibold text-lg max-w-sm transition-all ${
                 gameState === 'won' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600' :
                 gameState === 'failed' ? 'bg-red-500/20 border-red-500 text-red-500' :
                 isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-[#FFFBF0] border-green-200 text-slate-700'
              }`}>
                 {message}
              </div>
           </div>
       </div>

       {/* Right side - Logic Puzzle Grid */}
       <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 relative">
           <button 
              onClick={onExit}
              className={`absolute top-8 right-8 px-4 py-2 rounded-xl text-sm font-semibold shadow transition-all active:scale-95 flex items-center gap-2 ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-[#FFFBF0] hover:bg-slate-100'
              }`}
            >
              <X size={16} /> Exit Garden
            </button>

            <div className="mb-10 text-center">
               <h3 className="text-2xl font-bold mb-2">Level {level}</h3>
               <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Sequence Length: {sequenceLength}</p>
            </div>

            {gameState === 'idle' ? (
               <button 
                  onClick={generatePuzzle}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-lg transform hover:scale-105 active:scale-95 transition-all text-white ${
                     isDarkMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-green-500 hover:bg-green-400'
                  }`}
               >
                  <Droplets /> Water Plant
               </button>
            ) : (
               <div 
                  className="grid gap-3 transition-all duration-500" 
                  style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
               >
                  {tiles.map((tile, idx) => {
                     const isClicked = clickedTiles.includes(idx);
                     const isWrong = gameState === 'failed' && isClicked && tile > nextExpected;
                     const isRight = isClicked && !isWrong;

                     return (
                        <button
                           key={idx}
                           disabled={gameState !== 'playing' || isClicked}
                           onClick={() => handleTileClick(idx)}
                           className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl font-black shadow transition-all border-2 ${
                              !tile && isDarkMode ? 'bg-slate-800/30 border-slate-800/50' : 
                              !tile ? 'bg-green-50/50 border-green-100' :
                              isWrong ? 'bg-red-500 border-red-600 text-white' :
                              isRight ? 'bg-emerald-500 border-emerald-600 text-white scale-95 opacity-80' :
                              isDarkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white' : 'bg-[#FFFBF0] border-green-200 hover:bg-green-50 text-slate-800'
                           }`}
                        >
                           {tile && (gameState === 'playing' || isClicked) ? tile : ''}
                        </button>
                     );
                  })}
               </div>
            )}
       </div>
    </div>,
    document.body
  );
};

export default MindGarden;