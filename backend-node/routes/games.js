const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const GameProgress = require('../models/GameProgress');

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

// Get progress for all games
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await GameProgress.find({ userId: req.user.id });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch game progress', error: err.message });
  }
});

// Update or create progress for a specific game
router.post('/progress/:gameId', authenticateToken, async (req, res) => {
  try {
    const { level, score, unlockedFeatures } = req.body;
    const gameId = req.params.gameId;
    
    // Find and update or create if doesn't exist
    const updatedProgress = await GameProgress.findOneAndUpdate(
      { userId: req.user.id, gameId },
      { 
        $set: { level, score, lastPlayed: Date.now() },
        $addToSet: { unlockedFeatures: { $each: unlockedFeatures || [] } }
      },
      { new: true, upsert: true }
    );
    
    res.json(updatedProgress);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update game progress', error: err.message });
  }
});

module.exports = router;
