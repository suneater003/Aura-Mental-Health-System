import React, { useState } from 'react';
import { Eye, Hand, Volume2, Droplet, Heart, ChevronRight, Check } from 'lucide-react';
import axios from 'axios';
import { useMindfulTracker } from '../hooks/useMindfulTracker';

const CoolDown = ({ isDarkMode, onExit }) => {
  useMindfulTracker('CoolDown');
  const [stepIndex, setStepIndex] = useState(0);
  const [inputs, setInputs] = useState(['', '', '', '', '']); // Store answers for each step

  const persistProgress = async () => {
    try {
      const token = localStorage.getItem('aura_token');
      if (token) {
        await axios.post('http://localhost:5000/api/games/progress/cooldown-grounding', 
          { level: 1, score: 500, unlockedFeatures: ['Grounding Master'] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {}
  };

  const steps = [
    {
      num: 5,
      title: "Things You Can See",
      desc: "Look around you. Notice five things you can see right now. They can be big or small.",
      icon: <Eye size={32} />,
      color: "from-purple-500 to-indigo-500"
    },
    {
      num: 4,
      title: "Things You Can Feel",
      desc: "Pay attention to your body. What are four things you can physically feel?",
      icon: <Hand size={32} />,
      color: "from-sky-500 to-blue-500"
    },
    {
      num: 3,
      title: "Things You Can Hear",
      desc: "Listen closely. What are three sounds you can hear right now?",
      icon: <Volume2 size={32} />,
      color: "from-emerald-500 to-teal-500"
    },
    {
      num: 2,
      title: "Things You Can Smell",
      desc: "Take a deep breath in through your nose. What are two things you can smell?",
      icon: <Droplet size={32} />,
      color: "from-orange-500 to-amber-500"
    },
    {
      num: 1,
      title: "Thing You Can Taste",
      desc: "Focus on your mouth. What is one thing you can taste right now?",
      icon: <Heart size={32} />,
      color: "from-rose-500 to-pink-500"
    }
  ];

  const currentStep = steps[stepIndex];

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      // Completed, show a success message
      persistProgress();
      setStepIndex(steps.length);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className={`h-full flex flex-col p-6 md:p-8 rounded-[2rem] border backdrop-blur-md overflow-hidden ${
      isDarkMode ? 'bg-slate-900/60 border-slate-700 text-white' : 'bg-[#FFFBF0]/80 border-slate-200 text-slate-800'
    }`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">5-4-3-2-1 Grounding</h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Bring your mind back to the present moment.
          </p>
        </div>
        <button 
          onClick={onExit}
          className={`px-4 py-2 rounded-xl text-sm font-semibold shadow transition-all active:scale-95 ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          Exit Guide
        </button>
      </div>

      {stepIndex < steps.length ? (
        <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto w-full text-center space-y-8">
          <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-white bg-gradient-to-br shadow-xl mb-4 ${currentStep.color} animate-pulse-slow`}>
            {currentStep.icon}
          </div>
          
          <div>
             <h3 className="text-5xl font-black mb-2 flex items-center justify-center gap-4">
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentStep.color}`}>
                   {currentStep.num}
                </span>
                {currentStep.title}
             </h3>
             <p className={`text-lg font-medium max-w-lg mx-auto leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {currentStep.desc}
             </p>
          </div>

          <div className="w-full">
            <textarea
              className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all min-h-[120px] resize-none ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-600 focus:border-slate-500 focus:ring-slate-500 placeholder-slate-500' 
                  : 'bg-white border-slate-200 focus:border-slate-300 focus:ring-slate-300 placeholder-slate-400'
              }`}
              placeholder="Jot down what you notice here... (Optional)"
              value={inputs[stepIndex]}
              onChange={(e) => {
                const newInputs = [...inputs];
                newInputs[stepIndex] = e.target.value;
                setInputs(newInputs);
              }}
            />
          </div>

          <div className="flex items-center gap-4 w-full justify-center mt-8">
             <button 
               onClick={handlePrev}
               disabled={stepIndex === 0}
               className={`px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                 isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
               }`}
             >
               Previous
             </button>
             <button 
               onClick={handleNext}
               className={`px-8 py-3 flex items-center gap-2 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r ${currentStep.color}`}
             >
               {stepIndex === steps.length - 1 ? 'Finish' : 'Next Step'} <ChevronRight size={20} />
             </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
           <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-xl mb-4 animate-bounce`}>
              <Check size={48} />
           </div>
           <h3 className="text-3xl font-black mb-2">You Did It!</h3>
           <p className={`text-lg font-medium max-w-lg mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              You've completed the 5-4-3-2-1 grounding exercise. Hopefully, you feel more present and calmer now.
           </p>
           <button 
             onClick={onExit}
             className={`mt-8 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800`}
           >
             Return to Games
           </button>
        </div>
      )}
    </div>
  );
};

export default CoolDown;
