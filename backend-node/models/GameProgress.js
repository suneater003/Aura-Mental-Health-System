const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  score: {
    type: Number,
    default: 0,
  },
  unlockedFeatures: {
    type: [String],
    default: [],
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

gameProgressSchema.index({ userId: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model('GameProgress', gameProgressSchema);
