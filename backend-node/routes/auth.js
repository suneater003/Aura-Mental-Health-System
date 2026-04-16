// backend-node/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 1. SIGNUP ROUTE (Naya account banana)
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash the password (Security)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to DB
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Account created successfully! You can now login." });
    } catch (error) {
        res.status(500).json({ message: "Error creating account", error });
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
            process.env.JWT_SECRET, 
            { expiresIn: '30d' } // Token 30 din tak valid rahega (Offline mode ke liye best)
        );

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { username: user.username, email: user.email } 
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
});

module.exports = router;