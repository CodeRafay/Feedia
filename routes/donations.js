const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

// Get all donations (public - shows available donations)
router.get('/', async (req, res) => {
    try {
        const { status, category } = req.query;
        
        // Build query filter
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (category) {
            filter.category = category;
        }
        
        // If no status filter, default to showing available donations
        if (!status) {
            filter.status = 'available';
            filter.expirationTime = { $gt: new Date() };
        }

        const donations = await Donation.find(filter)
            .populate('donorId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            message: 'Donations retrieved successfully',
            count: donations.length,
            donations
        });
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get donations for authenticated donor
router.get('/my', auth(['donor']), async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.user.userId })
            .sort({ createdAt: -1 });

        res.json({
            message: 'Your donations retrieved successfully',
            count: donations.length,
            donations
        });
    } catch (error) {
        console.error('Get my donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single donation by ID
router.get('/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donorId', 'name email location');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.json({
            message: 'Donation retrieved successfully',
            donation
        });
    } catch (error) {
        console.error('Get donation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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

        // Validate required fields
        if (!foodType || !category || !quantity || !expirationTime) {
            return res.status(400).json({ 
                message: 'Food type, category, quantity, and expiration time are required' 
            });
        }

        // Create new donation
        const donation = new Donation({
            donorId: req.user.userId,
            foodType,
            category,
            quantity,
            expirationTime: new Date(expirationTime),
            image,
            location: {
                latitude: latitude || 0,
                longitude: longitude || 0
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

// Update donation status (donor can update their own, pickup can update to picked_up/delivered)
router.put('/:id', auth(['donor', 'pickup', 'admin']), async (req, res) => {
    try {
        const { status } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Check permissions
        const isOwner = donation.donorId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';
        const isPickup = req.user.role === 'pickup';

        if (!isOwner && !isAdmin && !isPickup) {
            return res.status(403).json({ message: 'Not authorized to update this donation' });
        }

        // Validate status transitions
        const validStatuses = ['available', 'picked_up', 'delivered', 'expired'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Update status if provided
        if (status) {
            donation.status = status;
        }

        await donation.save();

        res.json({
            message: 'Donation updated successfully',
            donation
        });
    } catch (error) {
        console.error('Update donation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete donation (owner or admin only)
router.delete('/:id', auth(['donor', 'admin']), async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Check permissions
        const isOwner = donation.donorId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this donation' });
        }

        await Donation.findByIdAndDelete(req.params.id);

        res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
        console.error('Delete donation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get nearby donations
router.get('/nearby/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const { maxDistance = 10 } = req.query; // Default 10 km

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ message: 'Invalid coordinates' });
        }

        // Simple distance-based query (approximation)
        const latDelta = parseFloat(maxDistance) / 111.32;
        const lngDelta = parseFloat(maxDistance) / (111.32 * Math.cos(latitude * Math.PI / 180));

        const donations = await Donation.find({
            status: 'available',
            expirationTime: { $gt: new Date() },
            'location.latitude': {
                $gte: latitude - latDelta,
                $lte: latitude + latDelta
            },
            'location.longitude': {
                $gte: longitude - lngDelta,
                $lte: longitude + lngDelta
            }
        }).populate('donorId', 'name');

        res.json({
            message: 'Nearby donations retrieved successfully',
            count: donations.length,
            donations
        });
    } catch (error) {
        console.error('Get nearby donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 