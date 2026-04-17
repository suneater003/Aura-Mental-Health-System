// backend-node/models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    // Ye line chat ko User se LOCK karti hai
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Ek user ka ek hi main chat document hoga
    },
    // Saari history is array mein save hogi
    history: [
        {
            role: { 
                type: String, 
                enum: ['user', 'model'], // Sirf ye do log ho sakte hain
                required: true 
            },
            text: { 
                type: String, 
                required: true 
            },
            timestamp: { 
                type: Date, 
                default: Date.now 
            }
        }
    ],
    // Chat Summary for 24 hours context
    lastDailySummary: {
        type: String,
        default: null
    },
    // AI Analyzed Days
    aiPositiveDays: {
        type: Number,
        default: 0
    },
    aiToughDays: {
        type: Number,
        default: 0
    },
    // Tere dashboard graphs ke liye mood data
    moodData: [
        {
            valence: Number, // Positivity/Negativity score (DistilBERT se aayega)
            arousal: Number, // Intensity score
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Chat', chatSchema);