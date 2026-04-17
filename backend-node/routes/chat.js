const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Chat = require('../models/chat');

// Inline middleware for auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret_fallback_key', (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token." });
        req.user = decoded; // Contains userId
        next();
    });
};

// GET: Fetch user's chat history
router.get('/', authenticateToken, async (req, res) => {
    try {
        let chat = await Chat.findOne({ userId: req.user.userId });
        
        // If no chat object exists, return an empty array
        if (!chat) {
            chat = await Chat.create({ userId: req.user.userId, history: [] });
        }

        // Automatic 24-Hour Reset & Summary generation Hook
        if (chat && chat.history && chat.history.length > 0) {
            const firstMessageDate = new Date(chat.history[0].timestamp);
            const now = new Date();
            
            // Check if 24 hours have passed since the first message in the current session
            if ((now - firstMessageDate) > 24 * 60 * 60 * 1000) {
                try {
                    console.log(`⏰ 24-hour chatting milestone reached. Analyzing day...`);
                    
                    // Get mood logs from last 24 hours for this user
                    const MoodLog = require('../models/MoodLog');
                    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    const moodLogs = await MoodLog.find({
                        userId: req.user.userId,
                        recordedAt: { $gte: yesterday, $lte: now }
                    });
                    
                    console.log(`   Found ${moodLogs.length} mood logs from last 24h`);
                    
                    // Send to Python to summarize chat history
                    const pyData = {
                        history_text: chat.history.map(m => `${m.role}: ${m.text}`).join('\n')
                    };
                    
                    let day_category = 'neutral';
                    let summary = '';
                    
                    try {
                        const pyRes = await fetch('http://127.0.0.1:8000/api/summarize_chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(pyData),
                            signal: AbortSignal.timeout(30000)
                        });
                        
                        if (pyRes.ok) {
                            const { summary: pySummary, day_category: pyCategory } = await pyRes.json();
                            summary = pySummary;
                            day_category = pyCategory;
                            console.log(`   Python says: ${day_category}`);
                        }
                    } catch (pyErr) {
                        console.error('   Python summarize failed:', pyErr.message);
                    }
                    
                    // Also analyze mood logs to get a second opinion on the day's valence
                    if (moodLogs.length > 0) {
                        const moodValences = moodLogs.map(m => m.valence || 'neutral');
                        const toughCount = moodValences.filter(v => v === 'tough').length;
                        const positiveCount = moodValences.filter(v => v === 'positive').length;
                        
                        console.log(`   Mood breakdown: ${positiveCount} positive, ${toughCount} tough`);
                        
                        // If moods are mostly tough, override to tough
                        if (toughCount > positiveCount) {
                            day_category = 'tough';
                        } else if (positiveCount > toughCount && positiveCount > 0) {
                            day_category = 'positive';
                        }
                    }
                    
                    // Store the summary and increment counter
                    chat.lastDailySummary = summary || 'You had a meaningful day with Aura. Keep opening up!';
                    if (day_category === 'positive') {
                        chat.aiPositiveDays = (chat.aiPositiveDays || 0) + 1;
                        console.log(`   ✅ Counted as POSITIVE day. Total positive: ${chat.aiPositiveDays}`);
                    } else if (day_category === 'tough') {
                        chat.aiToughDays = (chat.aiToughDays || 0) + 1;
                        console.log(`   ⚠️  Counted as TOUGH day. Total tough: ${chat.aiToughDays}`);
                    }
                    
                    chat.history = []; // Clear for the new day's conversation
                    await chat.save();
                    
                } catch(e) {
                    console.error("❌ Failed to automatically summarize chat: ", e.message);
                }
            }
        }
        res.json({ history: chat.history });
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// POST: Send new message to python backend & save to db
router.post('/', authenticateToken, async (req, res) => {
    const { user_message } = req.body;
    if (!user_message) return res.status(400).json({ message: "Message is required." });

    try {
        let chat = await Chat.findOne({ userId: req.user.userId });
        if (!chat) {
            chat = new Chat({ userId: req.user.userId, history: [] });
        }

        // Parse history for Python API: [[user, bot], ...]
        const pythonHistory = [];
        let tempUserMsg = null;
        
        chat.history.forEach(msg => {
            if (msg.role === 'user') {
                tempUserMsg = msg.text;
            } else if (msg.role === 'model' && tempUserMsg) {
                pythonHistory.push([tempUserMsg, msg.text]);
                tempUserMsg = null;
            }
        });

        // Save user message to our history array
        chat.history.push({ role: 'user', text: user_message });
        await chat.save(); // Save pre-response so not to lose user messages if py crashes

        // Send to Python Backend
        let pythonResponse;
        try {
            const pyRes = await fetch('http://127.0.0.1:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_message: user_message,
                    history: pythonHistory
                }),
                signal: AbortSignal.timeout(30000) // 30 seconds timeout
            });
            
            if (!pyRes.ok) {
                throw new Error(`Python API responded with status ${pyRes.status}`);
            }
            pythonResponse = await pyRes.json();
        } catch (pyError) {
            console.error("Python AI Error:", pyError.message);
            // Fallback text if Python is down
            pythonResponse = {
                response: "I'm having trouble connecting to my neural network right now, but please know I'm here for you.",
                action: "server_offline"
            };
        }

        // Save bot response to history
        chat.history.push({ role: 'model', text: pythonResponse.response });
        await chat.save();

        res.json({ 
            response: pythonResponse.response, 
            action: pythonResponse.action || "normal_chat",
            history: chat.history 
        });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Error processing your request" });
    }
});

// GET: Fetch AI Chat Summary
router.get('/summary', authenticateToken, async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.user.userId });
        if (!chat) return res.json({ summary: "No summary found. Talk to Aura to generate some insights!" });
        
        res.json({ summary: chat.lastDailySummary || "Aura is observing your chats. Keep conversing to learn beautiful things about yourself soon!" });
    } catch(e) {
        res.status(500).json({ message: "Failed to fetch AI chat summary" });
    }
});

// GET: AI Output Dashboard Counters (Day types)
router.get('/analysis', authenticateToken, async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.user.userId });
        if (!chat) return res.json({ positiveDays: 0, toughDays: 0 });
        
        res.json({
            positiveDays: chat.aiPositiveDays || 0,
            toughDays: chat.aiToughDays || 0
        });
    } catch(e) {
        res.status(500).json({ message: "Failed to fetch AI Analysis stats" });
    }
});

module.exports = router;
