// backend-node/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not to Say'],
        required: true
    },
    profilePicture: {
        type: String,
        default: '/avatars/default-avatar-1.png'
    },
    zenStreak: {
        type: Number,
        default: 0
    },
    lastCheckInDate: {
        type: Date,
        default: null
    },
    consecutiveCheckIns: {
        type: Number,
        default: 0
    },
    mindfulMinutes: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);