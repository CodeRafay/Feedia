const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['donor', 'pickup', 'admin'],
            message: '{VALUE} is not a valid role'
        }
    },
    location: {
        latitude: {
            type: Number,
            required: [true, 'Latitude is required']
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required']
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Add a compound index for location-based queries
userSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 