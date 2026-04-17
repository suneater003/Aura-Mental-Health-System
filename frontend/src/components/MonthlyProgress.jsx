import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Target } from 'lucide-react';

const MonthlyProgress = ({ moodHistory = [], isDarkMode = false }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Normalize mood score from 1-10 scale to 1-5 scale
  const normalizeMoodScore = (score) => {
    if (!score) return null;
    // Convert from 1-10 to 1-5 range
    return Math.round((score / 10) * 5) || 0;
  };

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    if (!moodHistory || moodHistory.length === 0) {
      return {
        averageMood: 0,
        positiveDays: 0,
        toughDays: 0,
        totalDays: 0,
        daysByMood: {},
        dailyMoods: [],
      };
    }

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    // Filter moods for selected month
    const monthMoods = moodHistory.filter((log) => {
      const logDate = new Date(log.recordedAt || log.createdAt);
      return logDate.getFullYear() === year && logDate.getMonth() === month;
    });

    // Create day map
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyMoods = Array(daysInMonth).fill(null);

    let totalScore = 0;
    let positiveDays = 0;
    let toughDays = 0;
    const daysByMood = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    monthMoods.forEach((log) => {
      const day = new Date(log.recordedAt || log.createdAt).getDate();
      const normalizedScore = normalizeMoodScore(log.moodScore);
      
      dailyMoods[day - 1] = normalizedScore;
      totalScore += normalizedScore;

      if (normalizedScore >= 4) positiveDays++;
      else if (normalizedScore <= 2) toughDays++;

      daysByMood[normalizedScore] = (daysByMood[normalizedScore] || 0) + 1;
    });

    const avgMood = monthMoods.length > 0 ? (totalScore / monthMoods.length).toFixed(1) : 0;

    return {
      averageMood: avgMood,
      positiveDays,
      toughDays,
      totalDays: monthMoods.length,
      daysByMood,
      dailyMoods,
    };
  }, [moodHistory, selectedMonth]);

  // Mood colors
  const moodColors = {
    5: { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Great' },
    4: { bg: 'bg-teal-500', text: 'text-teal-600', label: 'Good' },
    3: { bg: 'bg-sky-500', text: 'text-sky-600', label: 'Okay' },
    2: { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Low' },
    1: { bg: 'bg-rose-500', text: 'text-rose-600', label: 'Stressed' },
  };

  const handlePrevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1);
    if (nextMonth <= new Date()) {
      setSelectedMonth(nextMonth);
    }
  };

  const monthName = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0
  ).getDate();

  return (
    <div className={`w-full rounded-3xl p-8 backdrop-blur-md transition-all ${
      isDarkMode
        ? 'bg-slate-900/40 border border-slate-700/40'
        : 'bg-white/40 border border-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Calendar size={24} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'} />
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Monthly Progress
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Track your mood journey
            </p>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isDarkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ← Prev
        </button>
        <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {monthName}
        </h4>
        <button
          onClick={handleNextMonth}
          disabled={selectedMonth >= new Date()}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            selectedMonth >= new Date()
              ? isDarkMode
                ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                : 'bg-slate-100/50 text-slate-400 cursor-not-allowed'
              : isDarkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Next →
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Avg Mood
          </div>
          <div className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {monthlyStats.averageMood}
          </div>
          <div className="text-xs mt-1 text-slate-500">/5.0</div>
        </div>

        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Positive Days
          </div>
          <div className={`text-2xl font-black mt-1 text-emerald-500`}>
            {monthlyStats.positiveDays}
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Tough Days
          </div>
          <div className={`text-2xl font-black mt-1 text-rose-500`}>
            {monthlyStats.toughDays}
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Total Days Logged
          </div>
          <div className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {monthlyStats.totalDays}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-8">
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className={`text-center text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay())
              .fill(null)
              .map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const mood = monthlyStats.dailyMoods[idx];
              const moodData = mood ? moodColors[mood] : null;

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    mood
                      ? `${moodData.bg} text-white shadow-md`
                      : isDarkMode
                      ? 'bg-slate-700/30 text-slate-500'
                      : 'bg-slate-200/30 text-slate-500'
                  }`}
                  title={mood ? `Day ${day}: ${moodData.label}` : `Day ${day}: No check-in`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(moodColors).map(([score, { bg, label }]) => (
          <div key={score} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${bg}`} />
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyProgress;
