const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret_fallback_key', (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token." });
        // Handling both userId (from old chat route assumption) and id (from other routes)
        req.user = decoded;
        req.userId = decoded.id || decoded.userId; 
        next();
    });
};

// GET user stats (Zen Streak & Mindful Minutes)
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        console.log(`📊 [STATS FETCH] User: ${req.userId}`);
        console.log(`   Before logic: Streak=${user.zenStreak}, Minutes=${user.mindfulMinutes}, LastActive=${user.lastActiveDate}`);
        
        // Simple streak logic on fetch
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let dirty = false;

        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - lastActive.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

            // If it's a new day, drop mindful minutes
            if (diffDays >= 1) {
                console.log(`   New day detected (${diffDays} days gap), resetting mindful minutes`);
                user.mindfulMinutes = 0;
                dirty = true;
            }

            // If user missed yesterday, reset streak
            if (diffDays > 1) {
                console.log(`   Gap > 1 day, resetting streak`);
                user.zenStreak = 0;
                dirty = true;
            }
        }

        if (dirty) await user.save();

        console.log(`   After logic: Streak=${user.zenStreak}, Minutes=${user.mindfulMinutes}`);

        res.json({
            zenStreak: user.zenStreak || 0,
            mindfulMinutes: user.mindfulMinutes || 0
        });
    } catch (err) {
        console.error(`❌ Error in /stats:`, err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// POST to update mindful minutes and/or streak
router.post('/stats/update', authenticateToken, async (req, res) => {
    try {
        const { addMinutes } = req.body; // e.g. { addMinutes: 5 }
        console.log(`📊 [STATS UPDATE] User: ${req.userId}, Adding: ${addMinutes} min`);
        
        const user = await User.findById(req.userId);
        if (!user) {
          console.log(`❌ User ${req.userId} not found`);
          return res.status(404).json({ message: 'User not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let incrementStreak = false;

        if (!user.lastActiveDate) {
            console.log(`   First time activity today`);
            incrementStreak = true;
            user.mindfulMinutes = 0; // Fresh start
        } else {
            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - lastActive.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

            console.log(`   Last active: ${lastActive.toDateString()}, Days since: ${diffDays}`);

            if (diffDays >= 1) {
                user.mindfulMinutes = 0; // Reset for new day
                if (diffDays > 1) {
                    user.zenStreak = 0; // Reset streak if gap > 1 day
                }
                incrementStreak = true; // Count today!
            }
        }

        if (addMinutes) {
            const oldMinutes = user.mindfulMinutes || 0;
            user.mindfulMinutes = (user.mindfulMinutes || 0) + parseInt(addMinutes);
            console.log(`   Mindful: ${oldMinutes} + ${addMinutes} = ${user.mindfulMinutes}`);
        }

        if (incrementStreak) {
            const oldStreak = user.zenStreak || 0;
            user.zenStreak = (user.zenStreak || 0) + 1;
            console.log(`   Streak: ${oldStreak} → ${user.zenStreak}`);
        }
        
        // Update to actual current time so we don't zero it randomly on same day fetching
        user.lastActiveDate = new Date(); 
        
        await user.save();
        console.log(`   ✅ Saved. Final: ${user.mindfulMinutes} min, Streak: ${user.zenStreak}`);

        res.json({
            zenStreak: user.zenStreak,
            mindfulMinutes: user.mindfulMinutes
        });

    } catch (err) {
        console.error(`❌ Error in /stats/update:`, err);
        res.status(500).json({ message: 'Error updating stats' });
    }
});

// POST daily check-in (Campfire Streak system)
router.post('/check-in', authenticateToken, async (req, res) => {
    try {
        console.log(`🔥 [DAILY CHECK-IN] User: ${req.userId}`);
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const lastCheckIn = user.lastCheckInDate ? new Date(user.lastCheckInDate) : null;
        const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn) : null;
        if (lastCheckInDate) {
            lastCheckInDate.setHours(0, 0, 0, 0);
        }

        const isSameDay = lastCheckInDate && lastCheckInDate.getTime() === today.getTime();

        if (isSameDay) {
            console.log(`   ℹ️ Already checked in today`);
            return res.json({
                checked_in_today: true,
                consecutive_check_ins: user.consecutiveCheckIns || 0,
                streak_updated: false,
                message: 'Already checked in today'
            });
        }

        // Calculate days since last check-in
        let daysSinceLastCheckIn = 0;
        if (lastCheckInDate) {
            const diffTime = today.getTime() - lastCheckInDate.getTime();
            daysSinceLastCheckIn = Math.round(diffTime / (1000 * 60 * 60 * 24));
        }

        console.log(`   Days since last check-in: ${daysSinceLastCheckIn}`);

        // Update streak logic
        let stretchChanged = false;
        if (daysSinceLastCheckIn <= 1 || daysSinceLastCheckIn === 0) {
            // Consecutive day - increment streak
            user.consecutiveCheckIns = (user.consecutiveCheckIns || 0) + 1;
            console.log(`   ✅ Streak incremented to: ${user.consecutiveCheckIns}`);
            stretchChanged = true;
        } else if (daysSinceLastCheckIn === 2) {
            // Missed one day - reset to 1
            user.consecutiveCheckIns = 1;
            console.log(`   ⚠️ Missed one day, streak reset to 1`);
            stretchChanged = true;
        } else {
            // Missed more than one day - reset completely
            user.consecutiveCheckIns = 1;
            console.log(`   ❌ Missed ${daysSinceLastCheckIn - 1} days, streak reset to 1`);
            stretchChanged = true;
        }

        // Update last check-in date
        user.lastCheckInDate = new Date();
        await user.save();

        console.log(`   ✅ Check-in saved. Consecutive check-ins: ${user.consecutiveCheckIns}`);

        res.json({
            checked_in_today: true,
            consecutive_check_ins: user.consecutiveCheckIns,
            streak_updated: stretchChanged,
            fire_level: user.consecutiveCheckIns,
            message: `You have a ${user.consecutiveCheckIns}-day streak!`
        });
    } catch (err) {
        console.error(`❌ Error in /check-in:`, err);
        res.status(500).json({ message: 'Error checking in' });
    }
});

// GET campfire streak status
router.get('/streak-status', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastCheckIn = user.lastCheckInDate ? new Date(user.lastCheckInDate) : null;
        let checkedInToday = false;

        if (lastCheckIn) {
            const lastCheckInDate = new Date(lastCheckIn);
            lastCheckInDate.setHours(0, 0, 0, 0);
            checkedInToday = lastCheckInDate.getTime() === today.getTime();
        }

        res.json({
            consecutive_check_ins: user.consecutiveCheckIns || 0,
            checked_in_today: checkedInToday,
            last_check_in: user.lastCheckInDate,
            fire_level: user.consecutiveCheckIns || 0
        });
    } catch (err) {
        console.error(`❌ Error in /streak-status:`, err);
        res.status(500).json({ message: 'Error fetching streak status' });
    }
});

module.exports = router;
