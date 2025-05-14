const express = require('express');
const router = express.Router();
const DropOff = require('../models/DropOff');

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

// Get nearest drop-off points
router.get('/nearby', async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 10 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                message: 'Latitude and longitude are required'
            });
        }

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