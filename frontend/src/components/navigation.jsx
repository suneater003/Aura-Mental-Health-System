// src/components/Navigation.jsx
import React from 'react';
import { Plant, Search, WorryJar, CalendarDays, BrainCircuit } from 'lucide-react'; // Example icons

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 w-full flex justify-center z-50 pt-4 px-4">
      <div className="flex items-center gap-6 px-12 py-3 rounded-full 
                      bg-[#FFFBF0]/70 dark:bg-slate-900/70 backdrop-blur-md 
                      border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Left Icons */}
        <div className="flex items-center gap-6">
          <Plant className="text-garden-light-coffee dark:text-garden-dark-pumpkin hover:text-blue-500 cursor-pointer" size={24} />
          <Search className="text-slate-400 dark:text-slate-500 hover:text-blue-500 cursor-pointer" size={24} />
        </div>

        {/* Central Text */}
        <h1 className="text-2xl font-black text-slate-800 dark:text-white mx-6 tracking-tight">
          Mental Garden
        </h1>

        {/* Right Icons */}
        <div className="flex items-center gap-6">
          <WorryJar className="text-slate-400 dark:text-slate-500 hover:text-blue-500 cursor-pointer" size={24} />
          <CalendarDays className="text-slate-400 dark:text-slate-500 hover:text-blue-500 cursor-pointer" size={24} />
          <BrainCircuit className="text-slate-400 dark:text-slate-500 hover:text-blue-500 cursor-pointer" size={24} />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;