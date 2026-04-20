require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const Donation = require('./models/Donation');

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

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
}

let expirationInterval = null;
let serverInstance = null;

// Connect to MongoDB and start the server
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');

        // Run expiration check on startup
        markExpiredDonations();

        // Schedule expiration check every 5 minutes
        expirationInterval = setInterval(markExpiredDonations, 5 * 60 * 1000);

        // Start server
        const PORT = process.env.PORT || 5000;
        serverInstance = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
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
            if (serverInstance) {
                serverInstance.close(() => {
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        })
        .catch((err) => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
        });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
