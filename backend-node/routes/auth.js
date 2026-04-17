// backend-node/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Fallback Avatars
const AVATARS = [
    '/avatars/avatar-1.png',
    '/avatars/avatar-2.png',
    '/avatars/avatar-3.png',
    '/avatars/avatar-4.png',
    '/avatars/avatar-5.png'
];

const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

// Helper: Calculate Age on the backend before sending
const calculateAge = (dob) => {
    if (!dob) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
};

// Middleware: Authenticate Token for protected routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret_fallback_key', (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token." });
        req.user = decoded; // Pack the decoded user id to request
        next();
    });
};

// 1. GET CURRENT USER (Fetch fresh session data /me)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                dob: user.dob,
                age: calculateAge(user.dob), // Pass the calculated server age natively
                gender: user.gender,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data", error: error.message });
    }
});

// Update Profile (Picture, Name, Gender, DOB, etc)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { profilePicture, fullName, gender, dob } = req.body;
        
        let updateData = {};
        if (profilePicture) updateData.profilePicture = profilePicture;
        if (fullName) updateData.fullName = fullName;
        if (gender) updateData.gender = gender;
        if (dob) updateData.dob = dob;

        const user = await User.findByIdAndUpdate(
            req.user.userId, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                dob: user.dob,
                age: calculateAge(user.dob),
                gender: user.gender,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// 1. SIGNUP ROUTE (Naya account banana)
router.post('/signup', async (req, res) => {
    try {
        const { fullName, username, dob, email, password, gender, profilePicture } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (existingUser) return res.status(400).json({ message: "User with email or username already exists." });

        // Hash the password (Security)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Profile Picture Logic
        const assignedProfilePic = profilePicture || getRandomAvatar();

        // Save to DB
        const newUser = new User({ 
            fullName,
            username, 
            dob,
            email, 
            password: hashedPassword,
            gender,
            profilePicture: assignedProfilePic
        });
        await newUser.save();

        res.status(201).json({ message: "Account created successfully! You can now login." });
    } catch (error) {
        res.status(500).json({ message: "Error creating account", error: error.message });
    }
});

// 2. LOGIN ROUTE (Token generate karna)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find User
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token (The Digital ID Card)
        const token = jwt.sign(
            { userId: user._id, username: user.username }, 
            process.env.JWT_SECRET || 'supersecret_fallback_key', 
            { expiresIn: '30d' } // Token 30 din tak valid rahega (Offline mode ke liye best)
        );

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { 
                id: user._id,
                fullName: user.fullName,
                username: user.username, 
                email: user.email,
                dob: user.dob,
                age: calculateAge(user.dob),
                gender: user.gender,
                profilePicture: user.profilePicture
            } 
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

module.exports = router;