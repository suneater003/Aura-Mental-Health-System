const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  emotions: {
    type: [String],
    default: [],
  },
  notes: {
    type: String,
    trim: true,
  },
  associatedGameId: {
    type: String,
    default: null, // If the mood was recorded shortly after playing a game
  },
  valence: {
    type: String,
    enum: ['positive', 'neutral', 'tough'],
    default: 'neutral' // AI classification of whether this was a tough/positive/neutral moment
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

moodLogSchema.index({ userId: 1, recordedAt: -1 });

module.exports = mongoose.model('MoodLog', moodLogSchema);
