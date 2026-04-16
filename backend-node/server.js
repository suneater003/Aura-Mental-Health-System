// backend-node/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors()); // React ko API call karne dega
app.use(express.json()); // JSON data read karne ke liye

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 MongoDB Connected Successfully!'))
    .catch((err) => console.log('🔴 MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);

// Simple test route
app.get('/', (req, res) => {
    res.send('Aura Node.js Identity Server is Running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Node.js Server running on port ${PORT}`);
});