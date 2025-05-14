require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const pickupRoutes = require('./routes/pickups');
const dropOffRoutes = require('./routes/dropoffs');
const uploadRoutes = require('./routes/uploads');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/dropoffs', dropOffRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'public', 'index.html'));
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running' });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});