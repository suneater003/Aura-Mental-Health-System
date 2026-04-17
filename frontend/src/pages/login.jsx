import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Moon, Sun, Bot, Shield, Wind, Sparkles, Calendar, Camera, Upload } from 'lucide-react';
import axios from 'axios';

const LandingPage = ({ toggleTheme, isDarkMode }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Prefer Not to Say');
  const [profilePicture, setProfilePicture] = useState('');
  const fileInputRef = useRef(null);
  
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      if (isLoginMode) {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('aura_token', response.data.token);
        localStorage.setItem('aura_user', JSON.stringify(response.data.user));
        navigate('/warning');
      } else {
        await axios.post('http://localhost:5000/api/auth/signup', { 
            fullName, username, dob, email, password, gender, profilePicture 
        });
        alert("Sanctuary established! Please enter now.");
        setIsLoginMode(true);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Could not connect to the garden. Ensure the server is running.");
    }
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-colors duration-700 ${
      isDarkMode ? 'bg-[#1B1B1B] text-slate-200' : 'bg-gradient-to-br from-sky-50 via-white to-purple-50 text-slate-800'
    }`}>
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full mix-blend-screen filter blur-[100px] opacity-20 bg-orange-700 animate-pulse"></div>
            <div className="absolute top-[40%] right-[-10%] w-[30rem] h-[30rem] rounded-full mix-blend-screen filter blur-[100px] opacity-10 bg-blue-800 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[35rem] h-[35rem] rounded-full mix-blend-screen filter blur-[100px] opacity-10 bg-orange-900 animate-pulse animation-delay-4000"></div>
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 bg-sky-200 animate-pulse"></div>
            <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 bg-fuchsia-200 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 bg-pink-100 animate-pulse animation-delay-4000"></div>
          </>
        )}
      </div>

      {/* Top Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-2xl ${isDarkMode ? 'bg-orange-500/20 text-orange-500' : 'bg-sky-500/10 text-sky-500'}`}>
            <Sparkles size={28} />
          </div>
          <span className="text-2xl font-black tracking-tight">Aura</span>
        </div>
        <button 
          onClick={toggleTheme} 
          className={`p-3 rounded-full backdrop-blur-md border transition-all ${
            isDarkMode 
              ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700/80 text-orange-200' 
              : 'border-[#FFFBF0]/50 bg-[#FFFBF0]/50 shadow-sm hover:bg-[#FFFBF0] text-slate-600'
          }`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 flex flex-col lg:flex-row items-center justify-between gap-16 min-h-[calc(100vh-100px)]">
        
        {/* Left Side: Hero & Features */}
        <div className="flex-1 text-center lg:text-left space-y-12">
          
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-md ${
              isDarkMode ? 'bg-orange-900/20 border-orange-500/20 text-orange-400' : 'bg-[#FFFBF0]/60 border-sky-200/50 text-sky-700 shadow-sm'
            }`}>
              <Sparkles size={16} /> Welcome to Your Sanctuary
            </div>
            
            <h1 className={`text-5xl md:text-6xl tracking-tight font-extrabold leading-[1.1] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Your AI-Guided <br />
              <span className={`bg-clip-text text-transparent ${isDarkMode ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-sky-500 to-purple-500'}`}>
                Mental Health
              </span> Companion.
            </h1>
            
            <p className={`text-lg md:text-xl max-w-xl mx-auto lg:mx-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Aura is an offline-first sanctuary designed to ground you, listen to you, and help you bloom. Escape the noise and find clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: <Bot size={28} />,
                title: 'Python AI Chat',
                desc: 'A compassionate, locally-hosted AI strictly for mental wellness.',
                color: isDarkMode ? 'text-orange-500 bg-orange-500/10' : 'text-sky-500 bg-sky-500/10'
              },
              {
                icon: <Shield size={28} />,
                title: '100% Offline PWA',
                desc: 'Access grounding tools anytime, anywhere—even without internet.',
                color: isDarkMode ? 'text-blue-400 bg-blue-500/10' : 'text-purple-500 bg-purple-500/10'
              },
              {
                icon: <Wind size={28} />,
                title: 'Grounding Tools',
                desc: 'Interactive exercises, breathing cadences, and color therapy.',
                color: isDarkMode ? 'text-emerald-400 bg-emerald-500/10' : 'text-pink-500 bg-pink-500/10'
              }
            ].map((feature, idx) => (
              <div key={idx} className={`p-6 rounded-[2rem] backdrop-blur-xl border transition-all hover:-translate-y-1 ${
                isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : 'bg-[#FFFBF0]/60 border-[#FFFBF0]/80 hover:bg-[#FFFBF0]/80 shadow-xl shadow-sky-900/5'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className={`p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-2xl transition-all duration-700 ${
            isDarkMode 
              ? 'bg-[#1e1e24]/70 border-slate-700/50 shadow-[0_0_80px_rgba(234,88,12,0.08)]' 
              : 'bg-[#FFFBF0]/80 border-[#FFFBF0] shadow-[0_20px_80px_rgba(56,189,248,0.15)]'
          }`}>
            
            <div className="mb-8 text-center">
              <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {isLoginMode ? 'Welcome Back' : 'Begin Your Journey'}
              </h2>
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                {isLoginMode ? 'Enter your sanctuary' : 'Create your peaceful space'}
              </p>
            </div>

            {errorMsg && (
              <div className={`mb-6 p-4 rounded-2xl text-sm font-semibold border ${
                isDarkMode ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                      <div className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300 flex items-center justify-center ${
                        isDarkMode ? 'border-slate-700 bg-slate-800 hover:border-orange-500' : 'border-[#FFFBF0] bg-slate-100 hover:border-sky-400 shadow-md'
                      }`}>
                        {profilePicture ? (
                          <img src={profilePicture} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={32} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg ${
                        isDarkMode ? 'bg-orange-500 text-white' : 'bg-sky-500 text-white'
                      }`}>
                        <Upload size={14} />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <User className={`absolute left-5 top-[18px] transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-orange-500' : 'text-slate-400 group-focus-within:text-sky-500'}`} size={20} />
                    <input 
                      type="text" placeholder="Full Name" 
                      className={`w-full pl-14 pr-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 transition-all ${
                        isDarkMode 
                          ? 'bg-slate-900/50 border-slate-700 text-white focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-500' 
                          : 'bg-slate-50 border-slate-200/50 text-slate-900 focus:bg-white focus:ring-sky-500/30 focus:border-sky-500/50 placeholder-slate-400'
                      }`}
                      value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    />
                  </div>

                  <div className="relative group">
                    <User className={`absolute left-5 top-[18px] transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-orange-500' : 'text-slate-400 group-focus-within:text-sky-500'}`} size={20} />
                    <input 
                      type="text" placeholder="Username" 
                      className={`w-full pl-14 pr-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 transition-all ${
                        isDarkMode 
                          ? 'bg-slate-900/50 border-slate-700 text-white focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-500' 
                          : 'bg-slate-50 border-slate-200/50 text-slate-900 focus:bg-white focus:ring-sky-500/30 focus:border-sky-500/50 placeholder-slate-400'
                      }`}
                      value={username} onChange={(e) => setUsername(e.target.value)} required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <Calendar className={`absolute left-4 top-[18px] transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-orange-500' : 'text-slate-400 group-focus-within:text-sky-500'}`} size={20} />
                      <input 
                        type="date" 
                        className={`w-full pl-11 pr-3 py-4 rounded-2xl border focus:outline-none focus:ring-2 transition-all text-sm ${
                          isDarkMode 
                            ? 'bg-slate-900/50 border-slate-700 text-white focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-500' 
                            : 'bg-slate-50 border-slate-200/50 text-slate-900 focus:bg-[#FFFBF0] focus:ring-sky-500/30 focus:border-sky-500/50 placeholder-slate-400'
                        }`}
                        value={dob} onChange={(e) => setDob(e.target.value)} required
                      />
                    </div>
                    <div className="relative group">
                      <select 
                        className={`w-full px-4 py-4 rounded-2xl border focus:outline-none focus:ring-2 transition-all text-sm ${
                          isDarkMode 
                            ? 'bg-slate-900/50 border-slate-700 text-white focus:ring-orange-500/50 focus:border-orange-500/50' 
                            : 'bg-slate-50 border-slate-200/50 text-slate-900 focus:bg-[#FFFBF0] focus:ring-sky-500/30 focus:border-sky-500/50'
                        }`}
                        value={gender} onChange={(e) => setGender(e.target.value)} required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Other">Other</option>
                        <option value="Prefer Not to Say">Prefer Not to Say</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="relative group">
                <Mail className={`absolute left-5 top-[18px] transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-orange-500' : 'text-slate-400 group-focus-within:text-sky-500'}`} size={20} />
                <input 
                  type="email" placeholder="Email Address" 
                  className={`w-full pl-14 pr-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 transition-all ${
                    isDarkMode 
                      ? 'bg-slate-900/50 border-slate-700 text-white focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200/50 text-slate-900 focus:bg-white focus:ring-sky-500/30 focus:border-sky-500/50 placeholder-slate-400'
                  }`}
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>

              <div className="relative group">
                <Lock className={`absolute left-5 top-[18px] transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-orange-500' : 'text-slate-400 group-focus-within:text-sky-500'}`} size={20} />
                <input 
                  type="password" placeholder="Password" 
                  className={`w-full pl-14 pr-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 transition-all ${
                    isDarkMode 
                      ? 'bg-slate-900/50 border-slate-700 text-white focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200/50 text-slate-900 focus:bg-white focus:ring-sky-500/30 focus:border-sky-500/50 placeholder-slate-400'
                  }`}
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                />
              </div>
              
              <button type="submit" className={`w-full mt-2 py-4 rounded-2xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 shadow-orange-900/40' 
                  : 'bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:from-sky-400 hover:to-purple-400 shadow-sky-500/30'
              }`}>
                {isLoginMode ? 'Enter Aura' : 'Initiate Sanctuary'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                {isLoginMode ? "New to Aura? " : "Already have an account? "}
              </span>
              <button 
                className={`ml-1 font-bold hover:underline transition-colors ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-sky-600 hover:text-sky-500'}`}
                onClick={() => { setIsLoginMode(!isLoginMode); setErrorMsg(''); }}
              >
                {isLoginMode ? 'Join Here' : 'Log In'}
              </button>
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
};

export default LandingPage;