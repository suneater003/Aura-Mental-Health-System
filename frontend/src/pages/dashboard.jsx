import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Profile from './profile';
import Sanchuary from './sanchuary';
import HomeTab from './home';
import BreathingWidget from '../components/BreathingWidget';
import CrisisWarning from '../components/CrisisWarning';
import CampfireStreak from '../components/CampfireStreak';
import MonthlyProgress from '../components/MonthlyProgress';
import { 
  Home, 
  Map, 
  Sparkles, 
  Activity, 
  User as UserIcon,
  Wind,
  Flame,
  Send,
  Sun,
  Moon,
  MessageSquare,
  Gamepad2,
  CalendarHeart,
  Camera,
  Upload,
  Calendar,
  Star,
  Sprout,
  Settings,
  Bot
} from 'lucide-react';

const Dashboard = ({ toggleTheme, isDarkMode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_user');
      const parsedUser = stored ? JSON.parse(stored) : null;
      return parsedUser || { 
        username: 'Seeker', 
        fullName: 'Wandering Soul', 
        email: 'unknown@aura.com',
        dob: '2000-01-01',
        gender: 'Unknown'
      };
    } catch {
      return { username: 'Seeker' };
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('aura_activeTab') || 'Home';
  }); 

  useEffect(() => {
    localStorage.setItem('aura_activeTab', activeTab);
  }, [activeTab]);

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBreathingGame, setShowBreathingGame] = useState(false);
  const [campfireStreak, setCampfireStreak] = useState(0);
  const [moodHistory, setMoodHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isOnline || isTyping) return;

    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('aura_token');
      const res = await axios.post('http://localhost:5000/api/chat', {
        user_message: userMessage.text,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const botMessage = { text: res.data.response, sender: 'bot', action: res.data.action };
      setMessages(prev => [...prev, botMessage]);

      if (res.data.action === 'trigger_warning' || res.data.action === 'trigger_breathing') {
        setShowBreathingGame(true);
      }
    } catch (err) {
      console.error('Chat Error:', err);
      setMessages(prev => [...prev, { text: 'I am having trouble connecting right now, but please know I am here for you.', sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchFreshUserData = async () => {
      const token = localStorage.getItem('aura_token');
      if (token && isOnline) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
          localStorage.setItem('aura_user', JSON.stringify(res.data.user));
        } catch (err) {
        }
      }
    };
    
    const fetchChatHistory = async () => {
      const token = localStorage.getItem('aura_token');
      if (token && isOnline) {
        try {
          const res = await axios.get('http://localhost:5000/api/chat', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.history) {
            const mappedHistory = res.data.history.map(msg => ({
              sender: msg.role === 'model' ? 'bot' : 'user',
              text: msg.text
            }));
            setMessages(mappedHistory);
          }
        } catch (err) {
        }
      }
    };

    fetchFreshUserData();
    fetchChatHistory();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch mood data when Mood tab is opened
  useEffect(() => {
    if (activeTab === 'Mood') {
      fetchMoodCheckInData();
    }
  }, [activeTab]);

  const fetchMoodCheckInData = async () => {
    try {
      const token = localStorage.getItem('aura_token');
      if (!token) return;

      // Register daily check-in
      try {
        const checkInRes = await axios.post('http://localhost:5000/api/user/check-in', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Check-in registered:', checkInRes.data);
      } catch (e) {
        console.error('Failed to register check-in:', e);
      }

      // Fetch mood history
      const moodRes = await axios.get('http://localhost:5000/api/mood/history?limit=30', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMoodHistory(moodRes.data);

      // Fetch campfire streak
      try {
        const streakRes = await axios.get('http://localhost:5000/api/user/streak-status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCampfireStreak(streakRes.data.consecutive_check_ins || 0);
      } catch (e) {
        console.error('Failed to fetch streak:', e);
      }
    } catch (err) {
      console.error('Failed to fetch mood check-in data:', err);
    }
  };

  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Games', icon: Gamepad2, label: 'Sanctuary' },
    { id: 'Aura', icon: Sparkles, label: 'Aura AI' },
    { id: 'Mood', icon: CalendarHeart, label: 'Check-in' },
    { id: 'Profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-700 overflow-hidden ${
      isDarkMode ? 'bg-[#1B1B1B] text-slate-200' : 'bg-gradient-to-br from-sky-50 via-white to-purple-50 text-slate-800'
    }`}>
      
      <div className="fixed inset-0 pointer-events-none z-0">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full mix-blend-screen filter blur-[120px] opacity-20 bg-orange-700 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[35rem] h-[35rem] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.15] bg-blue-900 animate-pulse animation-delay-4000"></div>
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 bg-sky-200 animate-pulse"></div>
            <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 bg-fuchsia-200 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 bg-pink-100 animate-pulse animation-delay-4000"></div>
          </>
        )}
      </div>

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className={`flex items-center gap-2 md:gap-6 px-4 py-3 rounded-[2rem] backdrop-blur-2xl border shadow-2xl transition-all duration-500 ${
          isDarkMode 
            ? 'bg-[#1e1e24]/80 border-slate-700/50 shadow-[0_20px_80px_rgba(234,88,12,0.1)]' 
            : 'bg-[#FFFBF0]/80 border-[#FFFBF0]/60 shadow-[0_20px_80px_rgba(56,189,248,0.15)]'
        }`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center px-4 md:px-5 py-2.5 rounded-full transition-all duration-300 group ${
                  isActive 
                    ? (isDarkMode ? 'bg-orange-500/20 text-orange-400 font-bold' : 'bg-sky-500/10 text-sky-600 font-bold') 
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50')
                }`}
              >
                <item.icon size={22} className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : 'group-hover:scale-110'}`} />
                {isActive && (
                  <span className="text-[10px] md:text-[11px] mt-1 tracking-wide absolute -bottom-1 opacity-100 animate-fade-in-up">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
          
          <div className="pl-4 md:pl-6 ml-2 border-l border-slate-500/30">
            <button 
              onClick={toggleTheme} 
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                isDarkMode 
                  ? 'bg-slate-800/50 text-orange-300 border border-slate-700 hover:bg-slate-700' 
                  : 'bg-[#FFFBF0]/50 text-sky-600 border border-[#FFFBF0] hover:bg-[#FFFBF0] shadow-sm'
              }`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-36 pb-12 px-6 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-2rem)]">
        
        <div className={`lg:col-span-12 flex flex-col rounded-[2.5rem] border backdrop-blur-2xl overflow-hidden shadow-2xl transition-all duration-700 ${
           isDarkMode 
            ? 'bg-[#1e1e24]/70 border-slate-700/50 shadow-[0_20px_80px_rgba(234,88,12,0.08)]' 
            : 'bg-[#FFFBF0]/80 border-[#FFFBF0] shadow-[0_20px_80px_rgba(56,189,248,0.15)]'
        }`}>
          
          {activeTab === 'Aura' && (
            <>
              <div className={`px-8 py-6 border-b flex justify-between items-center backdrop-blur-md ${
                isDarkMode ? 'border-slate-700/50 bg-slate-900/30' : 'border-slate-100 bg-[#FFFBF0]/50'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                    isDarkMode ? 'bg-orange-500/20 text-orange-400 shadow-orange-900/20' : 'bg-purple-100 text-purple-600 shadow-purple-200/50'
                  }`}>
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Aura Companion</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Online & Listening
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col space-y-4 scroll-smooth">
                 {messages.length === 0 ? (
                   <div className="flex-1 flex flex-col justify-center items-center text-center opacity-60">
                     <div className={`p-6 rounded-full mb-6 relative ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div className={`absolute inset-0 rounded-full animate-pulse blur-xl opacity-50 ${isDarkMode ? 'bg-orange-500' : 'bg-purple-400'}`}></div>
                        <Sparkles className={`relative z-10 animate-pulse ${isDarkMode ? 'text-orange-400' : 'text-purple-500'}`} size={56} />
                     </div>
                     <h4 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                       Your mind is safe here.
                     </h4>
                     <p className={`text-base font-medium max-w-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                       Speak to Aura freely. The AI processes everything locally for complete privacy.
                     </p>
                   </div>
                 ) : (
                   messages.map((msg, idx) => (
                     msg.action === 'trigger_warning' ? (
                       <div key={idx} className="flex justify-start w-full">
                         <CrisisWarning 
                           isDarkMode={isDarkMode} 
                           onOpenBreathing={() => setShowBreathingGame(true)}
                         />
                       </div>
                     ) : (
                       <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm transform transition-all ${
                           msg.sender === 'user' 
                             ? isDarkMode ? 'bg-orange-600 text-white rounded-br-none' : 'bg-sky-500 text-white rounded-br-none'
                             : isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none' : 'bg-[#FFFBF0] border border-slate-200 text-slate-800 rounded-bl-none'
                         }`}>
                           {msg.text}
                         </div>
                       </div>
                     )
                   ))
                 )}
                 {isTyping && (
                    <div className="flex justify-start">
                       <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm rounded-bl-none flex space-x-2 items-center ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-[#FFFBF0] border border-slate-200'}`}>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-orange-500' : 'bg-sky-500'}`}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${isDarkMode ? 'bg-orange-500' : 'bg-sky-500'}`}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${isDarkMode ? 'bg-orange-500' : 'bg-sky-500'}`}></div>
                       </div>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
              </div>

              <div className={`p-6 md:p-8 border-t backdrop-blur-xl ${
                isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-[#FFFBF0]/60 border-slate-100'
              }`}>
                <form onSubmit={handleSendMessage} className="relative flex items-center group">
                  <input 
                    disabled={!isOnline || isTyping}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    type="text" 
                    placeholder={isOnline ? (isTyping ? 'Aura is replying...' : 'Express your thoughts...') : 'Waiting for connection...'}
                    className={`w-full pl-6 pr-16 py-5 rounded-2xl border focus:outline-none focus:ring-2 transition-all shadow-inner font-medium ${
                      isDarkMode 
                        ? 'bg-slate-950/50 border-slate-700 text-white focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-200/50 text-slate-900 focus:bg-[#FFFBF0] focus:ring-purple-500/30 focus:border-purple-500/50 placeholder-slate-400'
                    }`}
                  />
                  <button type="submit" disabled={!isOnline || !inputMessage.trim() || isTyping} className={`absolute right-3 p-3.5 rounded-xl transition-all duration-300 transform active:scale-95 group-focus-within:rotate-12 ${
                     isDarkMode 
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-900/40 hover:from-orange-500 hover:to-amber-500' 
                      : 'bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:from-sky-400 hover:to-purple-400'
                  }`}>
                    <Send size={20} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          )}

          {activeTab === 'Profile' && (
            <Profile 
              isDarkMode={isDarkMode} 
              user={user} 
              setUser={setUser} 
              isOnline={isOnline} 
              handleLogout={handleLogout} 
            />
          )}

          {activeTab === 'Games' && (
            <Sanchuary isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Home' && (
            <HomeTab isDarkMode={isDarkMode} />
          )}
          
          {activeTab === 'Mood' && (
             <div className={`flex-1 p-8 w-full h-full overflow-y-auto ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                  <CalendarHeart className={isDarkMode ? 'text-orange-400' : 'text-orange-500'} />
                  Daily Check-in & Progress
                </h2>

                {/* Campfire & Monthly Progress Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <CampfireStreak streakDays={campfireStreak} isDarkMode={isDarkMode} />
                  <MonthlyProgress moodHistory={moodHistory} isDarkMode={isDarkMode} />
                </div>
             </div>
          )}

        </div>

      </main>

      {showBreathingGame && (
        <BreathingWidget 
          isDarkMode={isDarkMode} 
          onExit={() => setShowBreathingGame(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;