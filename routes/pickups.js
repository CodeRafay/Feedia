const express = require('express');
const router = express.Router();
const Pickup = require('../models/Pickup');
const Donation = require('../models/Donation');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Get all pickups (admin only)
router.get('/', auth(['admin']), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }

        const pickups = await Pickup.find(filter)
            .populate('donationId')
            .populate('pickupUserId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Pickups retrieved successfully',
            count: pickups.length,
            pickups
        });
    } catch (error) {
        console.error('Get pickups error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get my pickups (for pickup service users)
router.get('/my', auth(['pickup']), async (req, res) => {
    try {
        const pickups = await Pickup.find({ pickupUserId: req.user.userId })
            .populate('donationId')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Your pickups retrieved successfully',
            count: pickups.length,
            pickups
        });
    } catch (error) {
        console.error('Get my pickups error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single pickup
router.get('/:id', auth([]), async (req, res) => {
    try {
        const pickup = await Pickup.findById(req.params.id)
            .populate('donationId')
            .populate('pickupUserId', 'name email');

        if (!pickup) {
            return res.status(404).json({ message: 'Pickup not found' });
        }

        res.json({
            message: 'Pickup retrieved successfully',
            pickup
        });
    } catch (error) {
        console.error('Get pickup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new pickup request (pickup service only)
router.post('/', auth(['pickup']), async (req, res) => {
    try {
        const { donationId } = req.body;

        if (!donationId) {
            return res.status(400).json({ message: 'Donation ID is required' });
        }

        // Check if donation exists and is available
        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(400).json({ message: 'Donation not found' });
        }

        if (donation.status !== 'available') {
            return res.status(400).json({ message: 'Donation is not available for pickup' });
        }

        // Check if there's already a pending pickup request
        const existingPickup = await Pickup.findOne({
            donationId,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingPickup) {
            return res.status(400).json({ message: 'A pickup request already exists for this donation' });
        }

        // Create new pickup request
        const pickup = new Pickup({
            donationId,
            pickupUserId: req.user.userId
        });

        // Save pickup request
        await pickup.save();

        // Update donation status
        donation.status = 'picked_up';
        await donation.save();

        // Send email notification to donor (non-blocking)
        sendPickupNotification(donation, req.user.name);

        res.status(201).json({
            message: 'Pickup request created successfully',
            pickup
        });
    } catch (error) {
        console.error('Create pickup request error:', error);

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

// Update pickup status
router.put('/:id', auth(['pickup', 'admin']), async (req, res) => {
    try {
        const { status } = req.body;
        
        const pickup = await Pickup.findById(req.params.id);
        if (!pickup) {
            return res.status(404).json({ message: 'Pickup not found' });
        }

        // Check permissions
        const isOwner = pickup.pickupUserId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this pickup' });
        }

        const validStatuses = ['pending', 'accepted', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (status) {
            pickup.status = status;
        }

        await pickup.save();

        // If completed, update donation status to delivered
        if (status === 'completed') {
            await Donation.findByIdAndUpdate(pickup.donationId, { status: 'delivered' });
        }

        res.json({
            message: 'Pickup updated successfully',
            pickup
        });
    } catch (error) {
        console.error('Update pickup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel pickup
router.delete('/:id', auth(['pickup', 'admin']), async (req, res) => {
    try {
        const pickup = await Pickup.findById(req.params.id);
        if (!pickup) {
            return res.status(404).json({ message: 'Pickup not found' });
        }

        // Check permissions
        const isOwner = pickup.pickupUserId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to cancel this pickup' });
        }

        // Only allow canceling pending pickups
        if (pickup.status !== 'pending') {
            return res.status(400).json({ message: 'Can only cancel pending pickups' });
        }

        // Restore donation status to available
        await Donation.findByIdAndUpdate(pickup.donationId, { status: 'available' });

        await Pickup.findByIdAndDelete(req.params.id);

        res.json({ message: 'Pickup cancelled successfully' });
    } catch (error) {
        console.error('Cancel pickup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to send email notification
async function sendPickupNotification(donation, pickupUserName) {
    try {
        // Only send if email credentials are configured
        if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
            console.log('Email credentials not configured, skipping notification');
            return;
        }

        // Find donor user
        const donor = await User.findById(donation.donorId);
        if (!donor || !donor.email) {
            return;
        }

        // Configure nodemailer transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: `Feedia <${process.env.GMAIL_USER}>`,
            to: donor.email,
            subject: 'Pickup Request for Your Donation',
            html: `
                <h2>Hello ${donor.name}!</h2>
                <p>Your donation of <strong>${donation.foodType}</strong> has been requested for pickup.</p>
                <p>Pickup service: ${pickupUserName || 'A volunteer'}</p>
                <p>Thank you for helping reduce food waste!</p>
                <br>
                <p>Best regards,<br>The Feedia Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Pickup notification email sent');
    } catch (emailErr) {
        console.error('Error sending pickup notification email:', emailErr);
    }
}

module.exports = router; 