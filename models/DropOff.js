const mongoose = require('mongoose');

const dropOffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    location: {
        latitude: {
            type: Number,
            required: [true, 'Latitude is required'],
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required'],
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
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
dropOffSchema.index({ name: 1 });
dropOffSchema.index({ address: 1 });

// Create a 2dsphere index for geospatial queries
dropOffSchema.index({
    'location.latitude': 1,
    'location.longitude': 1
});

// Add a method to get formatted location
dropOffSchema.methods.getFormattedLocation = function () {
    return {
        latitude: this.location.latitude,
        longitude: this.location.longitude
    };
};

// Add a method to calculate distance to another point
dropOffSchema.methods.calculateDistance = function (latitude, longitude) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(latitude - this.location.latitude);
    const dLon = this.toRad(longitude - this.location.longitude);
    const lat1 = this.toRad(this.location.latitude);
    const lat2 = this.toRad(latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper method to convert degrees to radians
dropOffSchema.methods.toRad = function (value) {
    return value * Math.PI / 180;
};

// Add a static method to find nearest drop-off points
dropOffSchema.statics.findNearest = async function (latitude, longitude, maxDistance = 10) {
    return this.find({
        'location.latitude': {
            $gte: latitude - maxDistance / 111.32, // 1 degree ≈ 111.32 km
            $lte: latitude + maxDistance / 111.32
        },
        'location.longitude': {
            $gte: longitude - maxDistance / (111.32 * Math.cos(latitude * Math.PI / 180)),
            $lte: longitude + maxDistance / (111.32 * Math.cos(latitude * Math.PI / 180))
        }
    });
};

const DropOff = mongoose.model('DropOff', dropOffSchema);

module.exports = DropOff; 