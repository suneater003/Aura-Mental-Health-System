import React from 'react';
import { Building2 } from 'lucide-react';

const CampfireStreak = ({ streakDays = 0, isDarkMode = false }) => {
  // Color palette for building blocks - rainbow progression
  const towerColors = [
    { bg: 'bg-red-500', border: 'border-red-600', light: 'bg-red-400' },
    { bg: 'bg-orange-500', border: 'border-orange-600', light: 'bg-orange-400' },
    { bg: 'bg-yellow-500', border: 'border-yellow-600', light: 'bg-yellow-400' },
    { bg: 'bg-green-500', border: 'border-green-600', light: 'bg-green-400' },
    { bg: 'bg-blue-500', border: 'border-blue-600', light: 'bg-blue-400' },
    { bg: 'bg-indigo-500', border: 'border-indigo-600', light: 'bg-indigo-400' },
    { bg: 'bg-purple-500', border: 'border-purple-600', light: 'bg-purple-400' },
    { bg: 'bg-pink-500', border: 'border-pink-600', light: 'bg-pink-400' },
  ];

  // Get color for a specific day
  const getBlockColor = (dayIndex) => {
    return towerColors[dayIndex % towerColors.length];
  };

  // Generate tower blocks based on streak
  const generateTowerBlocks = () => {
    const blocks = [];
    for (let i = 0; i < streakDays; i++) {
      blocks.push({
        day: i + 1,
        color: getBlockColor(i),
        delay: i * 0.1,
      });
    }
    return blocks;
  };

  const blocks = generateTowerBlocks();

  return (
    <div className={`w-full rounded-3xl p-8 backdrop-blur-md transition-all ${
      isDarkMode 
        ? 'bg-slate-900/30 border border-slate-700/50' 
        : 'bg-slate-100/50 border border-slate-300'
    }`}>
      {/* Title Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className={`text-2xl font-bold flex items-center gap-2 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-600'
          }`}>
            <Building2 size={28} />
            Daily Tower
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-300/60' : 'text-slate-600/60'}`}>
            Build your tower with every daily check-in
          </p>
        </div>
        <div className={`text-center px-4 py-2 rounded-xl ${
          isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
        }`}>
          <div className={`text-3xl font-black ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            {streakDays}
          </div>
          <div className={`text-xs font-semibold ${isDarkMode ? 'text-blue-200/70' : 'text-blue-600/70'}`}>
            {streakDays === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Tower Building Area */}
      <div className={`relative rounded-2xl overflow-hidden mb-6 flex items-end justify-center min-h-80 p-8 ${
        isDarkMode ? 'bg-slate-800/40' : 'bg-[#FFFBF0]/40'
      }`}>
        {/* Tower Container */}
        <div className="relative flex flex-col-reverse items-center justify-end gap-1">
          {blocks.length > 0 ? (
            blocks.map((block, idx) => (
              <div
                key={idx}
                className={`relative w-32 h-12 ${block.color} ${block.border} border-2 rounded-lg shadow-lg transition-all transform`}
                style={{
                  animation: `slideUp 0.5s ease-out ${block.delay}s backwards`,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Block number - centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white drop-shadow-lg">
                    {block.day}
                  </span>
                </div>
                
                {/* Shine effect */}
                <div className={`absolute top-1 left-2 w-8 h-2 ${block.light} rounded-full opacity-60 blur-sm`} />
              </div>
            ))
          ) : (
            <div className={`text-center py-12 px-6 rounded-lg ${isDarkMode ? 'bg-slate-700/30' : 'bg-slate-200/30'}`}>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Start building! 🏗️
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Check in today to place your first block
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className={`text-center text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {streakDays === 0 && (
          <p>Start your journey! Check in today to build your first block. 🏗️</p>
        )}
        {streakDays > 0 && streakDays < 10 && (
          <p>Amazing! 🎉 You have {streakDays} beautiful block{streakDays !== 1 ? 's' : ''} in your tower!</p>
        )}
        {streakDays >= 10 && streakDays < 30 && (
          <p>Incredible! 🚀 Your tower is growing strong with {streakDays} blocks!</p>
        )}
        {streakDays >= 30 && (
          <p>Legendary! ✨ You've built a magnificent tower of {streakDays} days!</p>
        )}
      </div>

      {/* Milestone Badges */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {[
          { day: 7, label: '1 Week', emoji: '📅' },
          { day: 14, label: '2 Weeks', emoji: '💪' },
          { day: 30, label: '1 Month', emoji: '🏆' },
          { day: 100, label: '100 Days', emoji: '👑' },
        ].map((milestone, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg text-center text-xs font-semibold transition-all ${
              streakDays >= milestone.day
                ? isDarkMode
                  ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                  : 'bg-yellow-200 text-yellow-700 border border-yellow-300'
                : isDarkMode
                ? 'bg-slate-800/30 text-slate-500'
                : 'bg-slate-200/30 text-slate-500'
            }`}
          >
            <div className="text-lg">{milestone.emoji}</div>
            <div>{milestone.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CampfireStreak;
