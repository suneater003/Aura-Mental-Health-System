import React from 'react';
import { AlertCircle, Wind, PhoneCall } from 'lucide-react';

const CrisisWarning = ({ isDarkMode, onOpenBreathing }) => {
  const helpLines = [
    { name: 'Student Counselor (SMIT) - Ms. Shivangee Gupta', number: '73766-94094' },
    { name: 'Medical / Ambulance', number: '96355-27557' },
    { name: 'Tele MANAS (24/7)', number: '14416' },
    { name: 'Vandrevala Foundation', number: '+91 9999 666 555' },
    { name: 'Kiran Mental Health', number: '1800-599-0019' },
  ];

  return (
    <div className={`max-w-2xl rounded-3xl p-6 md:p-8 backdrop-blur-md transition-all ${
      isDarkMode 
        ? 'bg-red-950/20 border border-red-900/40' 
        : 'bg-red-50/50 border border-red-200'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
          <AlertCircle size={24} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
            You're Not Alone
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-red-200/70' : 'text-red-600/70'}`}>
            Help is available right now
          </p>
        </div>
      </div>

      {/* Main Message */}
      <p className={`mb-6 text-base leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        What you're feeling is heavy, and you don't have to carry it alone. 
        If things feel overwhelming or unsafe right now, please reach out to someone who can support you immediately. 
        <span className="block mt-2 font-medium">Just calling is enough — there are people ready to listen.</span>
      </p>

      {/* Quick Help Lines */}
      <div className="mb-6 space-y-2">
        <p className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
          📞 Immediate Support
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {helpLines.map((line, idx) => (
            <a
              key={idx}
              href={`tel:${line.number.replace(/[^\d]/g, '')}`}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'bg-red-900/30 hover:bg-red-900/50 text-red-200' 
                  : 'bg-white/50 hover:bg-white text-red-700 border border-red-200/30'
              }`}
            >
              <PhoneCall size={16} className="flex-shrink-0" />
              <div className="text-left">
                <div className="text-xs font-semibold opacity-70">{line.name}</div>
                <div className="text-sm font-bold">{line.number}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Action Button - Open Breathing Widget */}
      <button
        onClick={onOpenBreathing}
        className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-900/30' 
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-lg shadow-blue-400/30'
        }`}
      >
        <Wind size={20} />
        Take a Calming Breath
      </button>

      {/* Supporting Text */}
      <p className={`text-xs text-center mt-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        You deserve support and safety. Take it one breath at a time. 💙
      </p>
    </div>
  );
};

export default CrisisWarning;
