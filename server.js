require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const pickupRoutes = require('./routes/pickups');
const dropOffRoutes = require('./routes/dropoffs');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const path = require('path');
const Donation = require('./models/Donation');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(express.static(path.join(__dirname, 'client', 'public')));

// Rate limiting configuration
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again later.' }
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/dropoffs', dropOffRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Rate limiter for static files (less restrictive)
const staticLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // More permissive for static files
    standardHeaders: true,
    legacyHeaders: false
});

// Serve React app for any other routes (SPA support)
app.get('*', staticLimiter, (req, res) => {
    // Check if requesting API route that doesn't exist
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    // Try to serve React build first
    const buildPath = path.join(__dirname, 'client', 'build', 'index.html');
    const publicPath = path.join(__dirname, 'client', 'public', 'index.html');
    
    // Check if build exists, otherwise serve public
    res.sendFile(buildPath, (err) => {
        if (err) {
            res.sendFile(publicPath, (err2) => {
                if (err2) {
                    res.status(404).send('Page not found');
                }
            });
        }
    });
});

// Function to mark expired donations
async function markExpiredDonations() {
    try {
        const result = await Donation.updateMany(
            {
                status: 'available',
                expirationTime: { $lt: new Date() }
            },
            {
                $set: { status: 'expired' }
            }
        );
        if (result.modifiedCount > 0) {
            console.log(`Marked ${result.modifiedCount} donations as expired`);
        }
    } catch (error) {
        console.error('Error marking expired donations:', error);
    }
}

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
}

// Store interval reference for cleanup
let expirationInterval = null;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        
        // Run expiration check on startup
        markExpiredDonations();
        
        // Schedule expiration check every 5 minutes
        expirationInterval = setInterval(markExpiredDonations, 5 * 60 * 1000);
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Graceful shutdown handler
const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    if (expirationInterval) {
        clearInterval(expirationInterval);
    }
    mongoose.connection.close()
        .then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
        });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});