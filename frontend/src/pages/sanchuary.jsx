import React, { useState } from 'react';
import { Map, Activity, Wind, Flame, Sun, MessageSquare, Gamepad2, Sprout } from 'lucide-react';
import BalloonPop from '../components/BalloonPop';
import CoolDown from '../components/CoolDown';
import BreathingWidget from '../components/BreathingWidget';
import ColourTherapy from '../components/ColourTherapy';
import EmotionMatching from '../components/EmotionMatching';
import LetItGo from '../components/LetItGo';
import MindGarden from '../components/MindGarden';
import BurnTheWorries from '../components/BurnTheWorries';
import ZenTileTapping from '../components/ZenTileTapping';

const Sanchuary = ({ isDarkMode }) => {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className={`h-full flex flex-col p-8 md:p-12 overflow-y-auto custom-scrollbar ${isDarkMode ? 'text-white' : 'text-slate-900'} w-full`}>
      {activeGame ? (
        <div className="flex-1 w-full h-full animate-in fade-in zoom-in duration-300">
          {activeGame === 'Stress Balloon Pop' && <BalloonPop isDarkMode={isDarkMode} onExit={() => setActiveGame(null)} />}
          {activeGame === 'Cool Down' && <CoolDown isDarkMode={isDarkMode} onExit={() => setActiveGame(null)} />}
          {activeGame === 'Meditation Quest' && <BreathingWidget isDarkMode={isDarkMode} fullScreen={true} onExit={() => setActiveGame(null)} />}
          {activeGame === 'Colour Therapy' && <ColourTherapy isDarkMode={isDarkMode} onExit={() => setActiveGame(null)} />}
          {activeGame === 'Emotion Matching' && <EmotionMatching isDarkMode={isDarkMode} onExit={() => setActiveGame(null)} />}
          {activeGame === 'Let It Go' && <LetItGo isDarkMode={isDarkMode} onExit={() => setActiveGame(null)} />}
          {activeGame === 'Mind Garden' && <MindGarden isDarkMode={isDarkMode} onExit={() => setActiveGame(null)} />}
          {activeGame === 'Burn The Worries' && <BurnTheWorries isDarkMode={isDarkMode} onExit={() => setActiveGame(null)} />}
          {activeGame === 'Zen Tile Tapping' && <ZenTileTapping isDarkMode={isDarkMode} onExit={() => setActiveGame(null)} />}
          {activeGame !== 'Stress Balloon Pop' && activeGame !== 'Cool Down' && activeGame !== 'Meditation Quest' && activeGame !== 'Colour Therapy' && activeGame !== 'Emotion Matching' && activeGame !== 'Let It Go' && activeGame !== 'Mind Garden' && activeGame !== 'Burn The Worries' && activeGame !== 'Zen Tile Tapping' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-[2rem] border backdrop-blur-md bg-slate-900/60 border-slate-700">
              <Gamepad2 size={64} className="text-slate-500 mb-6" />
              <h2 className="text-3xl font-bold mb-4">{activeGame}</h2>
              <p className="text-slate-400 mb-8 max-w-sm">This wellness suite is currently being built by the integration team. Check back soon!</p>
              <button 
                onClick={() => setActiveGame(null)}
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all"
              >
                Return to Games
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-8">
             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border mb-4 ${
               isDarkMode ? 'bg-orange-900/20 border-orange-500/20 text-orange-400' : 'bg-sky-100 border-sky-200/50 text-sky-700 shadow-sm'
             }`}>
               <Gamepad2 size={16} /> Grounding Sanctuary
             </div>
             <h2 className="text-3xl font-black mb-2">Offline Wellness Suites</h2>
             <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               These 8 grounding tools function entirely offline. Tap any card to begin an immersive mental exercise.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-10">
            {[
              { name: "Colour Therapy", desc: "Interact with living colors to match and soothe your mood.", icon: <Sun size={28} />, color: "bg-yellow-500" },
              { name: "Emotion Matching", desc: "Identify and validate complex feelings through visual cues.", icon: <MessageSquare size={28} />, color: "bg-pink-500" },
              { name: "Meditation Quest", desc: "A gamified breathing and guided meditation journey.", icon: <Wind size={28} />, color: "bg-sky-500" },
              { name: "Stress Balloon Pop", desc: "Assign worries to virtual balloons and pop them away.", icon: <Gamepad2 size={28} />, color: "bg-red-500" },
              { name: "Let It Go", desc: "A visualization tool where you write thoughts on leaves and watch them flow away.", icon: <Map size={28} />, color: "bg-emerald-500" },
              { name: "Mind Garden", desc: "Plant seeds of positivity. Watch them grow as you log in daily.", icon: <Sprout size={28} />, color: "bg-green-600" },
              { name: "Cool Down", desc: "Emergency grounding tactics for high-anxiety moments (5-4-3-2-1 method).", icon: <Flame size={28} />, color: "bg-indigo-500" },
              { name: "Burn The Worries", desc: "Type out your deepest worries to digital paper, then watch them burn into ash.", icon: <Flame size={28} />, color: "bg-orange-600" },
              { name: "Zen Tile Tapping", desc: "Find your rhythm. Tap the moving tiles in this silent focus game.", icon: <Activity size={28} />, color: "bg-teal-500" },
              { name: "Mystery Game", desc: "A new grounding experience is being cultivated by our team.", icon: <Gamepad2 size={28} />, color: "bg-slate-500" }
            ].map((game, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveGame(game.name)}
                className={`group relative p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden ${
                isDarkMode 
                  ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/80 shadow-lg' 
                  : 'bg-white/80 border-white/60 hover:bg-white hover:shadow-xl'
              }`}>
                {/* Decorative glow hover effect inside card */}
                <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${game.color}`}></div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 shadow-lg ${game.color} text-white`}>
                  {game.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10">{game.name}</h3>
                <p className={`text-sm leading-relaxed relative z-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {game.desc}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sanchuary;