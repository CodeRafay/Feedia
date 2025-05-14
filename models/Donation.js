const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Donor ID is required']
    },
    foodType: {
        type: String,
        required: [true, 'Food type is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['hot_meal', 'packaged', 'raw_ingredients'],
            message: '{VALUE} is not a valid category'
        }
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    expirationTime: {
        type: Date,
        required: [true, 'Expiration time is required'],
        validate: {
            validator: function (value) {
                return value > new Date();
            },
            message: 'Expiration time must be in the future'
        }
    },
    image: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: {
            values: ['available', 'picked_up', 'delivered', 'expired'],
            message: '{VALUE} is not a valid status'
        },
        default: 'available'
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
donationSchema.index({ donorId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ category: 1 });
donationSchema.index({ expirationTime: 1 });
donationSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Add a compound index for location-based queries
donationSchema.index({
    'location.latitude': 1,
    'location.longitude': 1,
    status: 1
});

// Add a method to check if donation is expired
donationSchema.methods.isExpired = function () {
    return new Date() > this.expirationTime;
};

// Add a pre-save middleware to update status if expired
donationSchema.pre('save', function (next) {
    if (this.isExpired()) {
        this.status = 'expired';
    }
    next();
});

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation; 