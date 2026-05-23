// backend-node/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const moodRoutes = require('./routes/mood');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(cors()); // React ko API call karne dega
app.use(express.json({ limit: '50mb' })); // Allow large image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 MongoDB Connected Successfully!'))
    .catch((err) => console.log('🔴 MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);

// Temporary compatibility aliases for older frontend builds that still call routes without /api
app.use('/auth', authRoutes);
app.use('/games', gamesRoutes);
app.use('/mood', moodRoutes);
app.use('/chat', chatRoutes);
app.use('/user', userRoutes);

// Simple test route
app.get('/', (req, res) => {
    res.send('Aura Node.js Identity Server is Running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Node.js Server running on port ${PORT}`);
});