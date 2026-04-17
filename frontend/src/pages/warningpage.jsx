import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, PhoneCall, ArrowRight } from 'lucide-react';

const WarningPage = ({ isDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700 ${
      isDarkMode ? 'bg-[#1B1B1B] text-slate-200' : 'bg-gradient-to-br from-sky-50 via-white to-purple-50 text-slate-800'
    }`}>
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {isDarkMode ? (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full mix-blend-screen filter blur-[120px] opacity-10 bg-orange-700 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[35rem] h-[35rem] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.15] bg-blue-900 animate-pulse animation-delay-4000"></div>
          </>
        ) : (
          <>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 bg-pink-200 animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[10%] w-[35rem] h-[35rem] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 bg-sky-200 animate-pulse animation-delay-2000"></div>
          </>
        )}
      </div>

      <div className={`p-8 md:p-10 rounded-[2.5rem] max-w-2xl w-full border backdrop-blur-2xl shadow-2xl transition-all duration-700 ${
        isDarkMode 
          ? 'bg-[#1e1e24]/80 border-slate-700/50 shadow-[0_20px_80px_rgba(234,88,12,0.08)]' 
          : 'bg-[#FFFBF0]/80 border-[#FFFBF0] shadow-[0_20px_80px_rgba(56,189,248,0.15)]'
      }`}>
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className={`p-4 rounded-2xl mb-5 shadow-inner ${
            isDarkMode ? 'bg-orange-500/10 text-orange-500 shadow-orange-900/20' : 'bg-sky-500/10 text-sky-500 shadow-sky-200/50'
          }`}>
             <ShieldAlert size={36} />
          </div>
          <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Safety Boundaries
          </h1>
          <p className={`text-sm mt-3 font-medium max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Before continuing, please acknowledge these vital guidelines for your well-being.
          </p>
        </div>

        <div className="space-y-6">
          <div className={`flex items-start gap-4 p-5 rounded-[1.5rem] border backdrop-blur-md ${
            isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-50/80 border-slate-200/50'
          }`}>
            <AlertTriangle className={`mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-orange-400' : 'text-amber-500'}`} size={24} />
            <div>
              <h2 className={`text-base font-bold mb-1.5 ${isDarkMode ? 'text-orange-400' : 'text-amber-700'}`}>
                Not a Professional Replacement
              </h2>
              <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Aura is an offline-first companion designed for support and reflection. It cannot diagnose conditions, prescribe treatment, or replace professional mental health care.
              </p>
            </div>
          </div>

          <div className={`rounded-[1.5rem] p-6 border backdrop-blur-md ${
            isDarkMode ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50/50 border-red-100'
          }`}>
            <div className={`flex items-center gap-2 mb-4 font-bold uppercase text-[0.7rem] tracking-wider ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`}>
              <PhoneCall size={16} />
              <span>In Case of Emergency</span>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'SMIT Counselor (Ms. Shivangee)', number: '+91 73766-94094' },
                { name: 'National Helpline (Tele MANAS)', number: '14416' },
                { name: 'Vandrevala Foundation', number: '+91 9999 666 555' }
              ].map((contact, idx) => (
                <div key={idx} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3.5 rounded-xl border transition-colors hover:border-transparent ${
                  isDarkMode 
                    ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800' 
                    : 'bg-[#FFFBF0] border-slate-100 hover:bg-[#FFFBF0]/80 shadow-sm'
                }`}>
                  <span className={`text-sm font-bold mb-1 sm:mb-0 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {contact.name}
                  </span>
                  <a href={`tel:${contact.number.replace(/\s/g, '')}`} className={`text-sm font-mono font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-slate-800 text-white hover:bg-orange-500/20 hover:text-orange-400' : 'bg-slate-100 text-slate-800 hover:bg-sky-100 hover:text-sky-700'
                  }`}>
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className={`group flex items-center justify-center gap-2 w-full mt-8 py-4 rounded-2xl font-bold text-[0.95rem] transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] ${
            isDarkMode 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-500 hover:to-amber-500 shadow-orange-900/40' 
              : 'bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:from-sky-400 hover:to-purple-400 shadow-sky-500/30'
          }`}
        >
          <span>I Understand the Boundaries</span>
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default WarningPage;