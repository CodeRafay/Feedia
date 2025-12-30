const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ revieweeId: req.params.userId })
            .populate('reviewerId', 'name')
            .populate('donationId', 'foodType')
            .sort({ createdAt: -1 });

        const stats = await Review.calculateAverageRating(req.params.userId);

        res.json({
            message: 'Reviews retrieved successfully',
            reviews,
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a review
router.post('/', auth([]), async (req, res) => {
    try {
        const { revieweeId, donationId, pickupId, rating, comment, type } = req.body;

        // Validate required fields
        if (!revieweeId || !rating || !type) {
            return res.status(400).json({ 
                message: 'Reviewee ID, rating, and type are required' 
            });
        }

        // Prevent self-review
        if (revieweeId === req.user.userId) {
            return res.status(400).json({ message: 'You cannot review yourself' });
        }

        // Verify reviewee exists
        const reviewee = await User.findById(revieweeId);
        if (!reviewee) {
            return res.status(404).json({ message: 'Reviewee not found' });
        }

        // Check for existing review for same donation/pickup
        const existingReview = await Review.findOne({
            reviewerId: req.user.userId,
            revieweeId,
            $or: [
                { donationId: donationId || null },
                { pickupId: pickupId || null }
            ]
        });

        if (existingReview) {
            return res.status(400).json({ 
                message: 'You have already reviewed this user for this transaction' 
            });
        }

        const review = new Review({
            reviewerId: req.user.userId,
            revieweeId,
            donationId,
            pickupId,
            rating,
            comment,
            type
        });

        await review.save();

        res.status(201).json({
            message: 'Review created successfully',
            review
        });
    } catch (error) {
        console.error('Create review error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a review
router.put('/:id', auth([]), async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only the reviewer can update their review
        if (review.reviewerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        if (rating) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();

        res.json({
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a review
router.delete('/:id', auth([]), async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only the reviewer or admin can delete
        const isOwner = review.reviewerId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get my reviews (reviews I've written)
router.get('/my/given', auth([]), async (req, res) => {
    try {
        const reviews = await Review.find({ reviewerId: req.user.userId })
            .populate('revieweeId', 'name')
            .populate('donationId', 'foodType')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Your reviews retrieved successfully',
            reviews
        });
    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get reviews about me
router.get('/my/received', auth([]), async (req, res) => {
    try {
        const reviews = await Review.find({ revieweeId: req.user.userId })
            .populate('reviewerId', 'name')
            .populate('donationId', 'foodType')
            .sort({ createdAt: -1 });

        const stats = await Review.calculateAverageRating(req.user.userId);

        res.json({
            message: 'Reviews about you retrieved successfully',
            reviews,
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews
        });
    } catch (error) {
        console.error('Get reviews about me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
