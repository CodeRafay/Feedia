const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reviewer ID is required']
    },
    revieweeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reviewee ID is required']
    },
    donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
    },
    pickupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pickup'
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    type: {
        type: String,
        required: [true, 'Review type is required'],
        enum: {
            values: ['donor_to_pickup', 'pickup_to_donor', 'beneficiary_feedback'],
            message: '{VALUE} is not a valid review type'
        }
    }
}, {
    timestamps: true
});

// Create indexes for efficient queries
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ revieweeId: 1 });
reviewSchema.index({ donationId: 1 });
reviewSchema.index({ pickupId: 1 });
reviewSchema.index({ type: 1 });

// Compound index for finding reviews between specific users
reviewSchema.index({ reviewerId: 1, revieweeId: 1 });

// Static method to calculate average rating for a user
reviewSchema.statics.calculateAverageRating = async function(userId) {
    const result = await this.aggregate([
        { $match: { revieweeId: userId } },
        { 
            $group: { 
                _id: '$revieweeId', 
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            } 
        }
    ]);
    
    return result.length > 0 
        ? { averageRating: result[0].averageRating, totalReviews: result[0].totalReviews }
        : { averageRating: 0, totalReviews: 0 };
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
