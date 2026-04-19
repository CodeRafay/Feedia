const express = require('express');
const router = express.Router();
const DropOff = require('../models/DropOff');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validation');

// Get all drop-off points
router.get('/', async (req, res) => {
    try {
        // Fetch all drop-off points
        const dropOffs = await DropOff.find()
            .select('name address location createdAt')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Drop-off points retrieved successfully',
            count: dropOffs.length,
            dropOffs
        });
    } catch (error) {
        console.error('List drop-off points error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Block legacy GET pattern to prevent leaking location data through URLs
router.get('/nearby', (req, res) => {
    return res.status(405).json({
        message: 'Use POST /api/dropoffs/nearby with coordinates in the request body.'
    });
});

// Get nearest drop-off points (requires POST to avoid leaking location data via URL)
router.post('/nearby', [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude is required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude is required'),
    body('maxDistance').optional({ checkFalsy: true }).isFloat({ min: 0.1, max: 500 }).toFloat()
], handleValidation, async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 10 } = req.body;

        // Find nearest drop-off points
        const dropOffs = await DropOff.findNearest(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(maxDistance)
        );

        // Calculate and add distance to each drop-off point
        const dropOffsWithDistance = dropOffs.map(dropOff => ({
            ...dropOff.toObject(),
            distance: dropOff.calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude)
            )
        }));

        // Sort by distance
        dropOffsWithDistance.sort((a, b) => a.distance - b.distance);

        res.json({
            message: 'Nearby drop-off points retrieved successfully',
            count: dropOffsWithDistance.length,
            dropOffs: dropOffsWithDistance
        });
    } catch (error) {
        console.error('List nearby drop-off points error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 
