const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
    donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: [true, 'Donation ID is required']
    },
    pickupUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Pickup user ID is required']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'accepted', 'completed'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes for efficient queries
pickupSchema.index({ donationId: 1 });
pickupSchema.index({ pickupUserId: 1 });
pickupSchema.index({ status: 1 });

// Add a compound index for status-based queries
pickupSchema.index({
    donationId: 1,
    status: 1
});

// Add a compound index for user's pickup requests
pickupSchema.index({
    pickupUserId: 1,
    status: 1
});

// Add a method to check if pickup is pending
pickupSchema.methods.isPending = function () {
    return this.status === 'pending';
};

// Add a method to check if pickup is completed
pickupSchema.methods.isCompleted = function () {
    return this.status === 'completed';
};

// Add a pre-save middleware to validate donation status
pickupSchema.pre('save', async function (next) {
    try {
        const Donation = mongoose.model('Donation');
        const donation = await Donation.findById(this.donationId);

        if (!donation) {
            throw new Error('Donation not found');
        }

        if (donation.status !== 'available') {
            throw new Error('Donation is not available for pickup');
        }

        next();
    } catch (error) {
        next(error);
    }
});

const Pickup = mongoose.model('Pickup', pickupSchema);

module.exports = Pickup; 