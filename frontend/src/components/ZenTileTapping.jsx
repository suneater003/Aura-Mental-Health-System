import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MousePointerClick, X, RefreshCcw, Play, Volume2, VolumeX, Headphones } from 'lucide-react';
import { useMindfulTracker } from '../hooks/useMindfulTracker';

const LANES = 4;
const INITIAL_DURATION = 3000; // 3 seconds to fall
const INITIAL_SPAWN_RATE = 800; // spawn every 800ms
const MIN_DURATION = 1000;
const MIN_SPAWN_RATE = 300;

const ZenTileTapping = ({ isDarkMode, onExit }) => {
  useMindfulTracker('ZenTileTapping');
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const durationRef = useRef(INITIAL_DURATION);
  const spawnRateRef = useRef(INITIAL_SPAWN_RATE);
  const tileIdCounter = useRef(0);
  const spawnTimerRef = useRef(null);
  const difficultyTimerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const noteIndexRef = useRef(0);
  const bgGainNodeRef = useRef(null);

  // C Pentatonic scale frequencies
  const PENTATONIC_SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  const toggleAudio = useCallback(() => {
    if (!isAudioEnabled) {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        
        // Create continuous binaural background
        bgGainNodeRef.current = audioCtxRef.current.createGain();
        bgGainNodeRef.current.gain.value = 0; // muted initially
        bgGainNodeRef.current.connect(audioCtxRef.current.destination);

        const merger = audioCtxRef.current.createChannelMerger(2);
        merger.connect(bgGainNodeRef.current);

        const oscL = audioCtxRef.current.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.value = 256; 
        oscL.connect(merger, 0, 0);

        const oscR = audioCtxRef.current.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.value = 262; 
        oscR.connect(merger, 0, 1);

        oscL.start();
        oscR.start();
      } else {
        audioCtxRef.current.resume();
      }
      setIsAudioEnabled(true);
    } else {
      if (bgGainNodeRef.current) bgGainNodeRef.current.gain.value = 0;
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsAudioEnabled(false);
    }
  }, [isAudioEnabled]);

  const playTapNote = useCallback(() => {
    if (!isAudioEnabled || !audioCtxRef.current) return;
    
    // Play melodic progression note
    const freq = PENTATONIC_SCALE[noteIndexRef.current % PENTATONIC_SCALE.length];
    noteIndexRef.current++;

    const osc = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    osc.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    const now = audioCtxRef.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.start(now);
    osc.stop(now + 1.5);

    // Keep ambient drone alive while playing
    if (bgGainNodeRef.current) {
      bgGainNodeRef.current.gain.setTargetAtTime(0.15, audioCtxRef.current.currentTime);
    }
  }, [isAudioEnabled]);

  const stopMusic = useCallback(() => {
    if (bgGainNodeRef.current && audioCtxRef.current) {
      bgGainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
    }
  }, []);

  // Stop everything
  const clearTimers = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (difficultyTimerRef.current) clearInterval(difficultyTimerRef.current);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTiles([]);
    durationRef.current = INITIAL_DURATION;
    spawnRateRef.current = INITIAL_SPAWN_RATE;
    tileIdCounter.current = 0;
    noteIndexRef.current = 0;
    
    startSpawning();
    startDifficultyScaling();

    if (isAudioEnabled && audioCtxRef.current) {
        audioCtxRef.current.resume();
    }
  };

  const gameOver = useCallback(() => {
    setGameState('over');
    clearTimers();
    stopMusic();
  }, [clearTimers, stopMusic]);

  const spawnTile = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const lane = Math.floor(Math.random() * LANES);
    const newTile = {
      id: tileIdCounter.current++,
      lane,
      duration: durationRef.current
    };
    
    setTiles(prev => [...prev, newTile]);
  }, [gameState]);

  const startSpawning = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    spawnTimerRef.current = setInterval(spawnTile, spawnRateRef.current);
  }, [spawnTile]);

  const startDifficultyScaling = useCallback(() => {
    if (difficultyTimerRef.current) clearInterval(difficultyTimerRef.current);
    // Increase difficulty every 10 seconds
    difficultyTimerRef.current = setInterval(() => {
      durationRef.current = Math.max(MIN_DURATION, durationRef.current * 0.9);
      spawnRateRef.current = Math.max(MIN_SPAWN_RATE, spawnRateRef.current * 0.9);
      
      // Update spawn timer to new rate
      startSpawning();
    }, 10000);
  }, [startSpawning]);

  useEffect(() => {
    if (gameState === 'playing') {
      startSpawning();
    }
    return clearTimers;
  }, [gameState, startSpawning, clearTimers]);

  const handleTap = (id) => {
    if (gameState !== 'playing') return;
    setTiles(prev => prev.filter(t => t.id !== id));
    setScore(s => s + 1);
    playTapNote();
  };

  const handleMiss = (id) => {
    if (gameState !== 'playing') return;
    // Tile reached the bottom!
    gameOver();
  };

  return createPortal(
    <div className={`fixed inset-0 z-[500] flex flex-col backdrop-blur-xl overflow-hidden shadow-2xl ${
      isDarkMode ? 'bg-slate-950/95 text-white' : 'bg-slate-50/95 text-slate-800'
    }`}>
      {/* Header (Absolute so it floats above the lanes) */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-start z-20 pointer-events-none">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 drop-shadow-md">
            <MousePointerClick className={isDarkMode ? 'text-teal-400' : 'text-teal-600'} />
            Zen Tile Tapping
          </h2>
          <p className={`text-sm drop-shadow-md ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Find your rhythm. Tap the tiles before they fall away.
          </p>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className={`text-xl font-bold px-6 py-2 rounded-xl backdrop-blur-sm ${
            isDarkMode ? 'bg-slate-900/50' : 'bg-[#FFFBF0]/50'
          }`}>
            Score: {score}
          </div>
          <button 
            onClick={toggleAudio}
            title="Toggle Binaural Beats (Wear Headphones for best effect)"
            className={`px-4 py-2 rounded-xl text-sm font-semibold shadow transition-all active:scale-95 flex items-center gap-2 ${
              isAudioEnabled 
                ? (isDarkMode ? 'bg-teal-900/60 text-teal-400' : 'bg-teal-100 text-teal-700')
                : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-[#FFFBF0] hover:bg-slate-100')
            }`}
          >
            {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {isAudioEnabled && <Headphones size={16} className="animate-pulse" />}
          </button>
          <button 
            onClick={onExit}
            className={`px-4 py-2 rounded-xl text-sm font-semibold shadow transition-all active:scale-95 flex items-center gap-2 ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-[#FFFBF0] hover:bg-slate-100'
            }`}
          >
            <X size={16} /> Exit
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto relative border-x border-slate-500/20 backdrop-blur-sm bg-slate-900/10">
        
        {/* Draw Lanes */}
        <div className="absolute inset-0 flex w-full pointer-events-none">
          {[...Array(LANES)].map((_, i) => (
            <div key={i} className={`flex-1 border-r border-slate-500/10 ${i === 0 ? 'border-l' : ''}`}></div>
          ))}
        </div>

        {/* Start Screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <button 
              onClick={startGame}
              className="px-10 py-5 rounded-[2rem] bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-white font-black text-2xl shadow-xl transform hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Play size={28} /> Start Flow
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'over' && (
          <div className="absolute inset-0 flex items-center justify-center z-30 animate-in zoom-in fade-in duration-300 bg-black/40 backdrop-blur-sm">
            <div className={`p-10 rounded-3xl text-center shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-[#FFFBF0]'}`}>
              <h3 className="text-4xl font-black mb-2 text-rose-500">Flow Broken</h3>
              <p className={`text-lg mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                You connected with {score} tiles.
              </p>
              <button 
                onClick={startGame}
                className="px-8 py-4 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-white font-bold text-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                <RefreshCcw /> Find Rhythm Again
              </button>
            </div>
          </div>
        )}

        {/* Falling Tiles */}
        <div className="absolute inset-0 overflow-hidden">
          {tiles.map(tile => (
            <div
              key={tile.id}
              onClick={() => handleTap(tile.id)}
              onAnimationEnd={() => handleMiss(tile.id)}
              className="absolute falling-tile cursor-pointer shadow-[0_0_20px_rgba(20,184,166,0.4)]"
              style={{
                left: `${(tile.lane * 100) / LANES}%`,
                width: `${100 / LANES}%`,
                animationDuration: `${tile.duration}ms`,
                // Adding a little padding to the width inside the lane
                padding: '4px'
              }}
            >
              <div className={`w-full h-full rounded-xl border-t border-[#FFFBF0]/20 transition-transform active:scale-90 ${
                isDarkMode ? 'bg-teal-600/90' : 'bg-teal-500'
              }`}></div>
            </div>
          ))}
        </div>

        {/* Bottom Hit Zone Indicator */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-teal-500/20 to-transparent pointer-events-none border-t border-teal-500/30"></div>
      </div>

      <style jsx>{`
        .falling-tile {
          top: -25%;
          height: 20%;
          animation-name: fallDown;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        @keyframes fallDown {
          0% { top: -25%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ZenTileTapping;