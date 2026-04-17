import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const EmotionCards = [
  { id: 1, type: 'happy', emoji: '😊', lightColor: 'bg-yellow-100', darkColor: 'bg-yellow-600/40' },
  { id: 2, type: 'calm', emoji: '😌', lightColor: 'bg-blue-100', darkColor: 'bg-blue-600/40' },
  { id: 3, type: 'angry', emoji: '😡', lightColor: 'bg-red-100', darkColor: 'bg-red-600/40' },
  { id: 4, type: 'sad', emoji: '😢', lightColor: 'bg-indigo-100', darkColor: 'bg-indigo-600/40' },
  { id: 5, type: 'anxious', emoji: '😬', lightColor: 'bg-orange-100', darkColor: 'bg-orange-600/40' },
  { id: 6, type: 'love', emoji: '💙', lightColor: 'bg-cyan-100', darkColor: 'bg-cyan-600/40' }
];

import { useMindfulTracker } from '../hooks/useMindfulTracker';

// Doubling and shuffling
const shuffleCards = () => {
  const deck = [...EmotionCards, ...EmotionCards].map(card => ({ ...card, uid: Math.random() }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const EmotionMatching = ({ isDarkMode, onExit }) => {
  useMindfulTracker('EmotionMatching');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(true); // Disable input initially
  const [matches, setMatches] = useState(0);
  const [initialPhase, setInitialPhase] = useState(true); // Tracking initial memorization

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newCards = shuffleCards();
    setCards(newCards);
    setSolved([]);
    setMatches(0);
    
    // Flip all cards initially
    setFlipped(newCards.map((_, i) => i));
    setDisabled(true);
    setInitialPhase(true);

    // Hide them after 3 seconds
    setTimeout(() => {
      setFlipped([]);
      setDisabled(false);
      setInitialPhase(false);
    }, 3000);
  };

  const handleCardClick = (index) => {
    if (disabled || flipped.includes(index) || solved.includes(cards[index].type) || initialPhase) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [first, second] = newFlipped;
      if (cards[first].type === cards[second].type) {
        setSolved(prev => [...prev, cards[first].type]);
        setMatches(m => m + 1);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  const isWin = matches === EmotionCards.length;

  return (
    <div className="h-full flex flex-col pt-2 pb-8 text-center text-slate-800">
      <div className="flex items-center justify-between mb-8">
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
          Emotion Matching
        </h2>
        <button onClick={startNewGame} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full">
        {initialPhase && (
          <p className={`mb-6 font-bold animate-pulse ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
            Memorize the tiles!
          </p>
        )}
        
        {isWin && (
          <div className={`p-6 rounded-3xl mb-8 animate-in fade-in zoom-in ${
            isDarkMode ? 'bg-orange-500/20 border border-orange-500/50' : 'bg-green-100 border border-green-300'
          }`}>
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-green-700'}`}>
              Mindfulness Achieved
            </h3>
            <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              You've matched all the emotions successfully.
            </p>
            <button onClick={startNewGame} className="mt-4 px-6 py-2 rounded-full font-bold bg-[#FFFBF0] text-slate-800 hover:bg-slate-100 shadow-sm">
              Play Again
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 lg:gap-6 [perspective:1000px]">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || solved.includes(card.type);
            return (
              <div 
                key={card.uid} 
                onClick={() => handleCardClick(index)}
                className={`relative w-full aspect-square cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
                  isFlipped ? '[transform:rotateY(180deg)]' : 'hover:-translate-y-1'
                }`}
              >
                {/* Back (Hidden side facing user initially, plain) */}
                <div className={`absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center [backface-visibility:hidden] shadow-md border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#FFFBF0] border-slate-200'
                }`}>
                   <span className={`text-4xl opacity-30 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>?</span>
                </div>
                
                {/* Front (Color-coded Emoji side) */}
                <div className={`absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-lg border ${
                  isDarkMode ? card.darkColor + ' border-white/10' : card.lightColor + ' border-black/5'
                }`}>
                   <span className="text-4xl drop-shadow-md lg:text-5xl">{card.emoji}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmotionMatching;