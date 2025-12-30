const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const DropOff = require('../models/DropOff');
const auth = require('../middleware/auth');

// Get admin dashboard statistics
router.get('/stats', auth(['admin']), async (req, res) => {
    try {
        // Get total counts
        const totalUsers = await User.countDocuments();
        const totalDonations = await Donation.countDocuments();
        const totalPickups = await Pickup.countDocuments();
        const totalDropOffs = await DropOff.countDocuments();

        // Get users by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        const usersByRoleObj = {};
        usersByRole.forEach(item => {
            usersByRoleObj[item._id] = item.count;
        });

        // Get donations by status
        const donationsByStatus = await Donation.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const donationsByStatusObj = {};
        donationsByStatus.forEach(item => {
            donationsByStatusObj[item._id] = item.count;
        });

        // Get recent donations
        const recentDonations = await Donation.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('donorId', 'name email');

        // Get recent users
        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            totalUsers,
            totalDonations,
            totalPickups,
            totalDropOffs,
            usersByRole: usersByRoleObj,
            donationsByStatus: donationsByStatusObj,
            recentDonations,
            recentUsers
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (admin only)
router.get('/users', auth(['admin']), async (req, res) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        
        const filter = {};
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        res.json({
            message: 'Users retrieved successfully',
            users,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user role (admin only)
router.put('/users/:id/role', auth(['admin']), async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['donor', 'pickup', 'admin'];

        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (admin only)
router.delete('/users/:id', auth(['admin']), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all donations for admin
router.get('/donations', auth(['admin']), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const filter = {};
        if (status) {
            filter.status = status;
        }

        const donations = await Donation.find(filter)
            .populate('donorId', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Donation.countDocuments(filter);

        res.json({
            message: 'Donations retrieved successfully',
            donations,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Admin get donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create drop-off point (admin only)
router.post('/dropoffs', auth(['admin']), async (req, res) => {
    try {
        const { name, address, latitude, longitude } = req.body;

        if (!name || !address) {
            return res.status(400).json({ message: 'Name and address are required' });
        }

        const dropOff = new DropOff({
            name,
            address,
            location: {
                latitude: latitude || 0,
                longitude: longitude || 0
            }
        });

        await dropOff.save();

        res.status(201).json({
            message: 'Drop-off point created successfully',
            dropOff
        });
    } catch (error) {
        console.error('Create drop-off error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update drop-off point (admin only)
router.put('/dropoffs/:id', auth(['admin']), async (req, res) => {
    try {
        const { name, address, latitude, longitude } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (address) updateData.address = address;
        if (latitude !== undefined && longitude !== undefined) {
            updateData.location = { latitude, longitude };
        }

        const dropOff = await DropOff.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!dropOff) {
            return res.status(404).json({ message: 'Drop-off point not found' });
        }

        res.json({
            message: 'Drop-off point updated successfully',
            dropOff
        });
    } catch (error) {
        console.error('Update drop-off error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete drop-off point (admin only)
router.delete('/dropoffs/:id', auth(['admin']), async (req, res) => {
    try {
        const dropOff = await DropOff.findByIdAndDelete(req.params.id);

        if (!dropOff) {
            return res.status(404).json({ message: 'Drop-off point not found' });
        }

        res.json({ message: 'Drop-off point deleted successfully' });
    } catch (error) {
        console.error('Delete drop-off error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark expired donations
router.post('/donations/expire', auth(['admin']), async (req, res) => {
    try {
        const result = await Donation.updateMany(
            {
                status: 'available',
                expirationTime: { $lt: new Date() }
            },
            {
                $set: { status: 'expired' }
            }
        );

        res.json({
            message: 'Expired donations updated',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Expire donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
