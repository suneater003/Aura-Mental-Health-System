import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Camera, Settings, Star, User as UserIcon } from 'lucide-react';

const getZodiacSign = (day, month) => {
  if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return "Capricorn ♑";
  if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return "Aquarius ♒";
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces ♓";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries ♈";
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus ♉";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini ♊";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer ♋";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo ♌";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo ♍";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra ♎";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio ♏";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius ♐";
  return "Unknown 🌟";
};

const ZodiacDisplay = ({ dob }) => {
  if (!dob) return "🌟";
  const date = new Date(dob);
  if (isNaN(date.getTime())) return "🌟";
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  return getZodiacSign(day, month);
};

const Profile = ({ isDarkMode, user, setUser, isOnline, handleLogout }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = useRef(null);

  const startEditing = () => {
    setEditForm({
      fullName: user.fullName || '',
      gender: user.gender || 'Prefer Not to Say',
      dob: user.dob ? user.dob.split('T')[0] : ''
    });
    setIsEditingProfile(true);
  };

  const cancelEditing = () => setIsEditingProfile(false);

  const saveProfileEdits = async () => {
    try {
      const token = localStorage.getItem('aura_token');
      if (token && isOnline) {
        const res = await axios.put('http://localhost:5000/api/auth/profile', 
          editForm,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        setUser(res.data.user);
        localStorage.setItem('aura_user', JSON.stringify(res.data.user));
        setIsEditingProfile(false);
      }
    } catch (err) {
      console.error("Failed to save profile edits", err);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newUrl = reader.result;
        const updatedUser = { ...user, profilePicture: newUrl };
        setUser(updatedUser);
        localStorage.setItem('aura_user', JSON.stringify(updatedUser));
        
        try {
          const token = localStorage.getItem('aura_token');
          if (token && isOnline) {
            await axios.put('http://localhost:5000/api/auth/profile', 
              { profilePicture: newUrl },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (err) {
          console.error("Failed to permanently save profile picture", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`h-full flex flex-col items-center justify-start p-8 md:p-12 overflow-y-auto custom-scrollbar ${isDarkMode ? 'text-white' : 'text-slate-900'} w-full`}>
      <div className="relative w-full max-w-2xl mt-4">
        
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 blur-3xl opacity-30 rounded-full -z-10 ${
          isDarkMode ? 'bg-orange-600' : 'bg-sky-400'
        }`}></div>

        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6 group">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-[4px] transition-all shadow-2xl flex items-center justify-center ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-900 group-hover:border-orange-500' 
                : 'border-white bg-slate-100 group-hover:border-sky-400'
            }`}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current.click()}
              className={`absolute bottom-0 right-0 p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 ${
                isDarkMode ? 'bg-orange-500 text-white' : 'bg-sky-500 text-white'
              }`}
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleProfilePictureChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <h2 className="text-3xl font-black">{user.fullName || user.username || 'Aura Member'}</h2>
          <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            @{user.username || 'username'}
          </p>
        </div>

        {isEditingProfile ? (
           <div className="grid grid-cols-1 gap-4 w-full">
             <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-[#FFFBF0]/60 border-slate-200/50'}`}>
               <label className={`text-xs font-bold uppercase mb-1 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</label>
               <input 
                 type="text" 
                 value={editForm.fullName} 
                 onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} 
                 className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 focus:ring-orange-500' : 'bg-slate-50 border-slate-200 focus:ring-sky-500'}`} 
               />
             </div>
             <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-[#FFFBF0]/60 border-slate-200/50'}`}>
               <label className={`text-xs font-bold uppercase mb-1 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Gender</label>
               <select 
                 value={editForm.gender} 
                 onChange={(e) => setEditForm({...editForm, gender: e.target.value})} 
                 className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 focus:ring-orange-500' : 'bg-slate-50 border-slate-200 focus:ring-sky-500'}`}
               >
                 <option value="Male">Male</option>
                 <option value="Female">Female</option>
                 <option value="Non-Binary">Non-Binary</option>
                 <option value="Other">Other</option>
                 <option value="Prefer Not to Say">Prefer Not to Say</option>
               </select>
             </div>
             <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-[#FFFBF0]/60 border-slate-200/50'}`}>
               <label className={`text-xs font-bold uppercase mb-1 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Date of Birth</label>
               <input 
                 type="date" 
                 value={editForm.dob} 
                 onChange={(e) => setEditForm({...editForm, dob: e.target.value})} 
                 className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 focus:ring-orange-500' : 'bg-slate-50 border-slate-200 focus:ring-sky-500'}`} 
               />
             </div>
             <div className="flex gap-4 mt-2">
               <button onClick={saveProfileEdits} className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${isDarkMode ? 'bg-orange-600 hover:bg-orange-500' : 'bg-sky-600 hover:bg-sky-500'}`}>Save Changes</button>
               <button onClick={cancelEditing} className={`flex-1 py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>Cancel</button>
             </div>
           </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          
          <div className={`relative p-4 rounded-2xl border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-[#FFFBF0]/60 border-slate-200/50'}`}>
            <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</p>
            <p className="font-semibold">{user.fullName || 'Not Provided'}</p>
            <button onClick={startEditing} className={`absolute top-4 right-4 ${isDarkMode ? 'text-orange-500' : 'text-sky-500'}`}><Settings size={18} /></button>
          </div>
          
          <div className={`p-4 rounded-2xl border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-[#FFFBF0]/60 border-slate-200/50'}`}>
            <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email</p>
            <p className="font-semibold">{user.email || 'Not Provided'}</p>
          </div>

          <div className={`p-4 rounded-2xl border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-[#FFFBF0]/60 border-slate-200/50'}`}>
            <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Gender</p>
            <p className="font-semibold">{user.gender || 'Not Provided'}</p>
          </div>
          
          <div className={`p-4 rounded-2xl border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-[#FFFBF0]/60 border-slate-200/50'}`}>
            <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Date of Birth</p>
            <p className="font-semibold">
              {user.dob && !isNaN(new Date(user.dob).getTime()) ? new Date(user.dob).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'Not Provided'}
            </p>
          </div>

          <div className={`col-span-1 md:col-span-2 mt-2 p-5 rounded-[1.5rem] border flex md:flex-row flex-col justify-between items-center gap-4 ${
            isDarkMode ? 'bg-orange-950/20 border-orange-900/30' : 'bg-sky-50/50 border-sky-100'
          }`}>
            
            <div className="flex items-center gap-4">
              <div className={`min-w-[3.5rem] px-3 h-12 flex flex-col items-center justify-center rounded-xl font-black text-2xl ${
                isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-sky-500/20 text-sky-600'
              }`}>
                 {user.age || '?'}
              </div>
              <div>
                <p className={`text-xs font-bold uppercase mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Age</p>
                <p className="text-sm">Years of journey</p>
              </div>
            </div>

            <div className="h-px md:h-12 w-full md:w-px bg-slate-500/20"></div>

            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl ${
                isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-600'
              }`}>
                 <Star size={24} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Astrological Sign</p>
                <p className="text-sm font-bold"><ZodiacDisplay dob={user.dob} /></p>
              </div>
            </div>

          </div>
          
          <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
            <button 
              onClick={handleLogout}
              className={`px-8 py-3 rounded-full font-bold transition-all transform hover:-translate-y-0.5 shadow-lg ${
                isDarkMode 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500' 
                  : 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500'
              }`}
            >
               Logout of Aura
            </button>
          </div>

        </div>
        )}
      </div>
    </div>
  );
};

export default Profile;