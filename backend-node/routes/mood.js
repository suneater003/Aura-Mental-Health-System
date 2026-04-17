const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const MoodLog = require('../models/MoodLog');

const jwtSecret = process.env.JWT_SECRET || 'aura_secret_key';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Create a new mood log
router.post('/log', authenticateToken, async (req, res) => {
  try {
    const { moodScore, emotions, notes, associatedGameId } = req.body;
    console.log(`📝 [MOOD LOG] User: ${req.user.id}, Score: ${moodScore}, Emotions: ${emotions}, Notes: ${notes ? 'yes' : 'no'}`);
    
    // Optional: Analyze the mood using Python backend if notes are provided
    let analyzedEmotion = emotions?.[0] || 'neutral';
    let valence = 'neutral';
    
    if (notes) {
      try {
        console.log(`   Analyzing notes for emotion...`);
        const pyRes = await fetch('http://127.0.0.1:8000/api/analyze_mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: notes,
            mood_score: moodScore
          }),
          signal: AbortSignal.timeout(10000)
        });
        
        if (pyRes.ok) {
          const analysis = await pyRes.json();
          analyzedEmotion = analysis.emotion;
          valence = analysis.valence;
          console.log(`   ✅ Analysis result: ${analyzedEmotion} (valence: ${valence})`);
        } else {
          console.log(`   ⚠️  Python API returned status ${pyRes.status}`);
        }
      } catch (e) {
        console.error(`   ❌ Error analyzing mood: ${e.message}`);
        // Fallback to provided emotion or infer from mood score
        if (moodScore >= 4) {
          valence = 'positive';
        } else if (moodScore <= 2) {
          valence = 'tough';
        }
      }
    } else {
      // Infer valence from mood score if no notes
      if (moodScore >= 4) {
        valence = 'positive';
        console.log(`   Score ${moodScore} → valence: positive`);
      } else if (moodScore <= 2) {
        valence = 'tough';
        console.log(`   Score ${moodScore} → valence: tough`);
      } else {
        console.log(`   Score ${moodScore} → valence: neutral`);
      }
    }
    
    const newMoodLog = new MoodLog({
      userId: req.user.id,
      moodScore,
      emotions: [analyzedEmotion],
      notes,
      associatedGameId,
      valence // Store the classification
    });
    
    await newMoodLog.save();
    console.log(`   ✅ Mood log saved! Final: Score=${moodScore}, Emotion=${analyzedEmotion}, Valence=${valence}`);
    
    res.status(201).json({ 
      message: 'Mood recorded successfully', 
      log: newMoodLog,
      analysis: { emotion: analyzedEmotion, valence }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to record mood', error: err.message });
  }
});

// Get user's recent mood logs
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 14; // Default to last 14 days
    const logs = await MoodLog.find({ userId: req.user.id })
                             .sort({ recordedAt: -1 })
                             .limit(limit);
    
    console.log(`📊 Fetched ${logs.length} mood logs for user ${req.user.id}`);
    logs.forEach(log => {
      console.log(`   ${new Date(log.recordedAt).toLocaleDateString()}: Score=${log.moodScore}, Emotion=${log.emotions?.[0]}, Valence=${log.valence}`);
    });
    
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch mood history', error: err.message });
  }
});

// GET: Analyze recent chat sentiment and suggest mood score
router.get('/analyze-chat-sentiment', authenticateToken, async (req, res) => {
  try {
    const Chat = require('../models/chat');
    const chat = await Chat.findOne({ userId: req.user.id });
    
    if (!chat || !chat.history || chat.history.length === 0) {
      return res.json({ 
        suggestedScore: 3,
        sentiment: 'neutral',
        message: 'No chat history to analyze'
      });
    }

    // Get recent chat messages (last few)
    const recentMessages = chat.history.slice(-10).filter(m => m.role === 'user').map(m => m.text).join(' ');
    
    if (!recentMessages) {
      return res.json({ 
        suggestedScore: 3,
        sentiment: 'neutral',
        message: 'No recent messages to analyze'
      });
    }

    console.log(`💭 Analyzing chat sentiment for user ${req.user.id}`);
    
    // Call Python sentiment analysis
    try {
      const pyRes = await fetch('http://127.0.0.1:8000/api/analyze_mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: recentMessages,
          mood_score: null
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (pyRes.ok) {
        const analysis = await pyRes.json();
        const valence = analysis.valence || 'neutral';
        
        // Map valence to mood score
        let suggestedScore = 3;
        if (valence === 'positive') {
          suggestedScore = 4; // Good
        } else if (valence === 'tough') {
          suggestedScore = 2; // Low
        }
        
        console.log(`   Analysis: ${analysis.emotion} (${valence}) → Suggested Score: ${suggestedScore}`);
        
        return res.json({
          suggestedScore,
          sentiment: valence,
          emotion: analysis.emotion,
          confidence: analysis.confidence || 0.5,
          message: `Based on your recent conversation, your mood might be: ${suggestedScore}/5`
        });
      }
    } catch (pyErr) {
      console.error('   Python sentiment analysis failed:', pyErr.message);
    }

    // Fallback: simple keyword analysis
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'amazing', 'wonderful', 'better', 'improve'];
    const negativeWords = ['bad', 'terrible', 'sad', 'angry', 'frustrated', 'depressed', 'anxious', 'stressed', 'worst'];
    
    const textLower = recentMessages.toLowerCase();
    const posCount = positiveWords.filter(w => textLower.includes(w)).length;
    const negCount = negativeWords.filter(w => textLower.includes(w)).length;
    
    let suggestedScore = 3;
    if (posCount > negCount) {
      suggestedScore = 4;
    } else if (negCount > posCount) {
      suggestedScore = 2;
    }
    
    console.log(`   Fallback: +${posCount} positive, -${negCount} negative → Score: ${suggestedScore}`);
    
    res.json({
      suggestedScore,
      sentiment: posCount > negCount ? 'positive' : negCount > posCount ? 'tough' : 'neutral',
      message: `Based on keyword analysis: ${suggestedScore}/5`
    });
    
  } catch (err) {
    console.error('❌ Error analyzing chat sentiment:', err);
    res.status(500).json({ message: 'Failed to analyze sentiment', error: err.message });
  }
});

module.exports = router;
