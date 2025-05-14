const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

// Create new donation (donor only)
router.post('/', auth(['donor']), async (req, res) => {
    try {
        const {
            foodType,
            category,
            quantity,
            expirationTime,
            image,
            latitude,
            longitude
        } = req.body;

        // Create new donation
        const donation = new Donation({
            donorId: req.user.userId,
            foodType,
            category,
            quantity,
            expirationTime: new Date(expirationTime),
            image,
            location: {
                latitude,
                longitude
            }
        });

        // Save donation to database
        await donation.save();

        res.status(201).json({
            message: 'Donation created successfully',
            donation
        });
    } catch (error) {
        console.error('Create donation error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 