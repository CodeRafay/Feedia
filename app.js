require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const pickupRoutes = require('./routes/pickups');
const dropOffRoutes = require('./routes/dropoffs');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

const app = express();
app.disable('x-powered-by');

// Security middleware
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600
};

app.use((req, res, next) => {
    const origin = req.header('Origin');
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ message: 'Origin not allowed by CORS policy' });
    }
    return cors(corsOptions)(req, res, next);
});

app.use(express.json({ limit: '1mb' }));
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
