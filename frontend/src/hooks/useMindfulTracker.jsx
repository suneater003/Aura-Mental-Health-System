import { useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * A hook to automatically track time spent in a mindful component/game
 * and update the user's mindfulMinutes in the backend when the component unmounts.
 */
export const useMindfulTracker = (activityName = 'Activity') => {
  const startTimeRef = useRef(Date.now());
  const loggedTimeRef = useRef(0);

  useEffect(() => {
    const componentStartTime = Date.now();
    startTimeRef.current = componentStartTime;
    loggedTimeRef.current = 0;

    console.log(`🎮 [${activityName}] Player entered at ${new Date().toLocaleTimeString()}`);

    // Ping backend proactively every 60 seconds to ensure time is saved even if they don't gracefully unmount
    const intervalId = setInterval(() => {
        const token = localStorage.getItem('aura_token');
        console.log(`⏱️  [${activityName}] 60-sec ping - Token present: ${!!token}`);
        
        if (token) {
            axios.post(`${API_BASE_URL}/user/stats/update`, 
                { addMinutes: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then(res => {
              console.log(`✅ [${activityName}] Added 1 min. New total: ${res.data.mindfulMinutes}`);
              loggedTimeRef.current += 1;
            })
            .catch(err => console.error(`❌ [${activityName}] 60-sec ping failed:`, err.response?.data || err.message));
        } else {
          console.error(`❌ [${activityName}] No token found in localStorage!`);
        }
    }, 60000);

    return () => {
      clearInterval(intervalId);
      const endTime = Date.now();
      const timeSpentMs = endTime - startTimeRef.current;
      
      // Calculate total minutes (rounded up so even short times count as 1 min)
      const totalMinutesSpent = Math.ceil(timeSpentMs / 60000); 
      const remainingMinutesToLog = totalMinutesSpent - loggedTimeRef.current;

      console.log(`👋 [${activityName}] Player exited at ${new Date().toLocaleTimeString()}`);
      console.log(`   Time spent: ${(timeSpentMs / 1000).toFixed(1)}s = ${totalMinutesSpent} min`);
      console.log(`   Already logged: ${loggedTimeRef.current} min, Remaining: ${remainingMinutesToLog} min`);

      if (remainingMinutesToLog > 0) {
        const token = localStorage.getItem('aura_token');
        console.log(`   Unmount token present: ${!!token}`);
        
        if (token) {
          axios.post(`${API_BASE_URL}/user/stats/update`, 
            { addMinutes: remainingMinutesToLog },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(res => {
            console.log(`   ✅ Unmount POST success. New total: ${res.data.mindfulMinutes}`);
          })
          .catch(err => {
            console.error(`   ❌ Unmount POST failed:`, err.response?.data || err.message);
          });
        } else {
          console.error(`   ❌ No token in unmount handler!`);
        }
      }
    };
  }, [activityName]);
};
