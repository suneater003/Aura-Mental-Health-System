import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, Smile, Frown, Meh, Heart, CloudLightning, 
  Flame, Clock, Brain, TrendingUp, CalendarHeart, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import PWAInstallButton from '../components/PWAInstallButton';

const API_BASE_URL = 'http://localhost:5000/api';

const MOODS = [
  { score: 5, label: 'Great', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
  { score: 4, label: 'Good', icon: Heart, color: 'text-teal-500', bg: 'bg-teal-500/20' },
  { score: 3, label: 'Okay', icon: Meh, color: 'text-sky-500', bg: 'bg-sky-500/20' },
  { score: 2, label: 'Low', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-500/20' },
  { score: 1, label: 'Stressed', icon: CloudLightning, color: 'text-rose-500', bg: 'bg-rose-500/20' },
];

const THOUGHTS = [
  "You are capable of amazing things.",
  "Breathe in courage, exhale doubt.",
  "Every small step is progress.",
  "Your mind is a garden; plant positivity.",
  "It's okay to rest and recharge.",
];

const Home = ({ isDarkMode }) => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [thought, setThought] = useState('');
  
  // New State variables for Backend data
  const [hasAnchoredToday, setHasAnchoredToday] = useState(false);
  const [zenStreak, setZenStreak] = useState(0);
  const [mindfulMinutes, setMindfulMinutes] = useState(0);
  const [chatSummary, setChatSummary] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState({ positiveDays: 0, toughDays: 0 });

  useEffect(() => {
    setThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)]);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('aura_token');
      if (!token) return;
      
      // Register daily check-in first
      try {
        const checkInRes = await axios.post(`${API_BASE_URL}/user/check-in`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Check-in registered from Home page:', checkInRes.data);
      } catch (e) {
        console.error('Failed to register check-in from Home page:', e);
      }
      
      // Fetch Mood History
      const moodRes = await axios.get(`${API_BASE_URL}/mood/history?limit=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const logs = moodRes.data;
      setMoodHistory(logs);
      
      // Check if anchored today
      if (logs.length > 0) {
        const latestLogDate = new Date(logs[0].recordedAt || logs[0].createdAt);
        const today = new Date();
        // Midnight reset check
        if (
          latestLogDate.getDate() === today.getDate() &&
          latestLogDate.getMonth() === today.getMonth() &&
          latestLogDate.getFullYear() === today.getFullYear()
        ) {
          setHasAnchoredToday(true);
          setSelectedMood(logs[0].moodScore);
        }
      }

      // Real data for User Stats
      const statsRes = await axios.get(`${API_BASE_URL}/user/stats`, { headers: { Authorization: `Bearer ${token}` } });
      setZenStreak(statsRes.data.zenStreak || 0);
      setMindfulMinutes(statsRes.data.mindfulMinutes || 0);
      
      // Fetch AI Chat Analysis for Positive/Tough days classification:
      const aiStatsRes = await axios.get(`${API_BASE_URL}/chat/analysis`, { headers: { Authorization: `Bearer ${token}` } });
      setAiAnalysis({ positiveDays: aiStatsRes.data.positiveDays, toughDays: aiStatsRes.data.toughDays });
      
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  const handleMoodSubmit = async (score) => {
    if (hasAnchoredToday) {
      console.log('ℹ️ Already anchored today, skipping mood submission');
      return; // Prevent double logging before midnight
    }
    
    setSelectedMood(score);
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('aura_token');
      if (token) {
        const moodLabel = MOODS.find(m => m.score === score)?.label || 'Unknown';
        console.log(`📝 Logging mood: Score=${score}, Label=${moodLabel}`);
        
        const moodRes = await axios.post(`${API_BASE_URL}/mood/log`, 
          { moodScore: score, emotions: [moodLabel] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('✅ Mood logged successfully:', moodRes.data);
        
        // Refresh dashboard data after logging
        await fetchDashboardData();
        console.log('✅ Dashboard data refreshed after mood submission');
      }
    } catch (err) {
      console.error("❌ Failed to log mood:", err);
    } finally {
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const fetchChatSummary = async () => {
    try {
      const token = localStorage.getItem('aura_token');
      // Live endpoint fetching for the updated AI chat summary
      const res = await axios.get(`${API_BASE_URL}/chat/summary`, { headers: { Authorization: `Bearer ${token}` } });
      setChatSummary(res.data.summary);
      setIsSummaryModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch chat summary", err);
    }
  };

  // Convert raw DB history into Last 7 Days chart data
  const processChartData = () => {
    if (!Array.isArray(moodHistory) || moodHistory.length === 0) return [{ name: 'Today', score: 3 }];
    
    const dailyMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    moodHistory.forEach(log => {
      const dateObj = new Date(log.recordedAt || log.createdAt || new Date());
      dateObj.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
      let dayStr = "Unknown";
      
      try {
        if (daysDiff === 0) {
          dayStr = "Today";
        } else if (daysDiff === 1) {
          dayStr = "Yesterday";
        } else {
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
          const date = dateObj.getDate();
          dayStr = `${weekday}, ${month} ${date}`;
        }
      } catch(e) {
        dayStr = "Unknown";
      }

      if (!dailyMap[dayStr]) {
        dailyMap[dayStr] = { sum: 0, count: 0, date: dateObj };
      }
      dailyMap[dayStr].sum += (Number(log.moodScore) || 3);
      dailyMap[dayStr].count += 1;
    });

    const chartData = Object.keys(dailyMap)
      .map(day => ({
        name: day,
        score: parseFloat((dailyMap[day].sum / dailyMap[day].count).toFixed(1)),
        date: dailyMap[day].date
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 7)
      .reverse(); // Show oldest on left, newest on right
    
    return chartData;
  };

  const chartData = processChartData();

  // AI Insight logic
  const getInsight = () => {
    const recentScores = chartData.map(d => d.score);
    if (!recentScores.length) return "Log your mood to receive insights!";
    const avg = recentScores.reduce((acc, v) => acc + v, 0) / recentScores.length;
    if (avg >= 4) return "You've been glowing lately! Keep up the amazing energy and share your light.";
    if (avg >= 3) return "Steady and balanced. It's the perfect time to explore the Sanctuary for deep growth.";
    return "Looks like a tough week. Don't forget your breathing exercises and chat with Aura.";
  };

  return (
    <div className={`p-4 md:p-8 w-full h-full overflow-y-auto ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* HEADER & THOUGHT OF THE DAY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black mb-1 flex items-center gap-3">
            <Sparkles className={isDarkMode ? 'text-orange-400' : 'text-purple-500'} />
            Wellness Dashboard
          </h2>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Your mental sanctuary at a glance.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-6 py-4 rounded-3xl border backdrop-blur-md max-w-sm shadow-sm ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-[#FFFBF0]/60 border-slate-200'
          }`}>
            <p className="text-sm font-semibold opacity-70 mb-1">Thought of the Day</p>
            <p className="italic font-medium">"{thought}"</p>
          </div>
          <PWAInstallButton variant="primary" />
        </div>
      </div>

      {/* TOP WIDGETS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-center items-center text-center transition-all ${
          isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-gradient-to-br from-[#FFFBF0] to-sky-50 border-[#FFFBF0]'
        }`}>
          <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mb-4">
            <Flame size={28} />
          </div>
          <h3 className="text-3xl font-black mb-1">{zenStreak} Days</h3>
          <p className="text-sm font-bold opacity-60 uppercase tracking-wider">Zen Streak</p>
        </div>

        <div className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-center items-center text-center transition-all ${
          isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-gradient-to-br from-[#FFFBF0] to-emerald-50 border-[#FFFBF0]'
        }`}>
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
            <Clock size={28} />
          </div>
          <h3 className="text-3xl font-black mb-1">{mindfulMinutes} Min</h3>
          <p className="text-sm font-bold opacity-60 uppercase tracking-wider">Mindful Minutes</p>
        </div>

        <div className={`p-6 rounded-[2rem] border shadow-sm flex items-start text-left transition-all col-span-1 md:col-span-1 flex-col justify-between ${
          isDarkMode ? 'bg-gradient-to-br from-indigo-900/30 to-slate-950 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <Brain size={20} />
            </div>
            <p className="font-bold uppercase tracking-wider opacity-80 text-sm">Aura Insight</p>
          </div>
          <p className="text-base font-medium leading-relaxed">
            {getInsight()}
          </p>
        </div>

      </div>

      {/* MIDDLE ROW: GRAPH & MOOD CHECK IN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* GRAPH DATA */}
        <div className={`lg:col-span-8 p-6 md:p-8 rounded-[2.5rem] border shadow-sm ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-[#FFFBF0]/80 border-slate-100'
        }`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <TrendingUp className={isDarkMode ? 'text-teal-400' : 'text-teal-500'} />
              7-Day Mood Flow
            </h3>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDarkMode ? '#3b82f6' : '#8b5cf6'} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={isDarkMode ? '#3b82f6' : '#8b5cf6'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} dy={10} />
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} ticks={[1,2,3,4,5]} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="score" stroke={isDarkMode ? '#3b82f6' : '#8b5cf6'} strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MOOD CHECK-IN PANEL */}
        <div className={`lg:col-span-4 p-6 md:p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-center relative ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-[#FFFBF0]/80 border-slate-100'
        }`}>
          <h3 className="text-xl font-bold mb-6 text-center">How are you feeling right now?</h3>
          
          <div className="grid grid-cols-5 gap-2 md:gap-3 mb-6 relative">
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood.score;
              return (
                <button
                  key={mood.score}
                  onClick={() => handleMoodSubmit(mood.score)}
                  disabled={isSubmitting || hasAnchoredToday}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                    isSelected && !hasAnchoredToday
                      ? `${mood.bg} ${mood.color} scale-110 drop-shadow-md border border-current` 
                      : `hover:bg-slate-500/10 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} hover:scale-105 active:scale-95 border border-transparent`
                  } ${hasAnchoredToday ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <mood.icon size={28} className="mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{mood.label}</span>
                </button>
              );
            })}
            
            {/* Lock Overlay if already anchored */}
            {hasAnchoredToday && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm rounded-2xl">
                 <p className="font-bold text-sm text-white text-center px-3 mb-1">Mood anchored for today.</p>
                 <p className="text-xs text-slate-300">Resets at midnight.</p>
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-xl text-center text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
            {isSubmitting 
              ? 'Recording your entry...' 
              : hasAnchoredToday 
                ? 'Check-in saved. Thank you for anchoring yourself.' 
                : 'Tap an icon to save your current state of mind.'}
          </div>
        </div>

      </div>

      {/* BOTTOM MONTHLY SUMMARY */}
      <div className={`w-full p-6 md:p-8 rounded-[2.5rem] border shadow-md flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative ${
        isDarkMode ? 'bg-[#191922] border-slate-800' : 'bg-gradient-to-r from-purple-500 to-indigo-500 border-transparent text-white'
      }`}>
        <div className="relative z-10 flex items-center gap-5">
           <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#FFFBF0]/20 text-white'}`}>
             <CalendarHeart size={32} />
           </div>
           <div>
             <h3 className="text-2xl font-black mb-1">Monthly Summary</h3>
             <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-purple-100'}`}>A snapshot of your emotional weather</p>
           </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-4 w-full md:w-auto items-center justify-end">
          <div className={`py-3 px-6 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-[#FFFBF0]/10 border-[#FFFBF0]/20 backdrop-blur-sm'}`}>
             <p className="text-sm uppercase font-bold opacity-70 mb-1">AI Positive Days</p>
             <p className="text-3xl font-black">{aiAnalysis.positiveDays}</p>
          </div>
          <div className={`py-3 px-6 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-[#FFFBF0]/10 border-[#FFFBF0]/20 backdrop-blur-sm'}`}>
             <p className="text-sm uppercase font-bold opacity-70 mb-1">AI Tough Days</p>
             <p className="text-3xl font-black">{aiAnalysis.toughDays}</p>
          </div>
          
          {/* New Chat Summary Button */}
          <button 
             onClick={fetchChatSummary}
             className={`flex items-center gap-2 py-4 px-6 rounded-2xl font-bold transition-transform hover:scale-105 ${
               isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-[#FFFBF0] text-indigo-600 hover:bg-indigo-50'
             }`}
          >
             <FileText size={20} />
             View AI Summary
          </button>
        </div>
      </div>

      {/* AI Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-slate-200' : 'bg-[#FFFBF0] text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="text-indigo-500" />
                AI Conversation Summary
              </h3>
              <button 
                onClick={() => setIsSummaryModalOpen(false)}
                className="text-slate-500 hover:text-red-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-500/10 mb-6">
              <p className="leading-relaxed text-sm md:text-base">
                {chatSummary || "Loading your summary..."}
              </p>
            </div>
            <button 
              onClick={() => setIsSummaryModalOpen(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
