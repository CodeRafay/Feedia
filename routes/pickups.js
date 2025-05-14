const express = require('express');
const router = express.Router();
const Pickup = require('../models/Pickup');
const Donation = require('../models/Donation');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Create new pickup request (pickup service only)
router.post('/', auth(['pickup']), async (req, res) => {
    try {
        const { donationId } = req.body;

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
            status: 'pending'
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
        (async () => {
            try {
                // Find donor user
                const donor = await User.findById(donation.donorId);
                if (donor && donor.email) {
                    // Configure nodemailer transport
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_PASS
                        }
                    });

                    const mailOptions = {
                        from: `Local Food Sharing <${process.env.GMAIL_USER}>`,
                        to: donor.email,
                        subject: 'Pickup Request for Your Donation',
                        text: `Dear ${donor.name}, your donation of ${donation.foodType} has been requested for pickup.`
                    };

                    await transporter.sendMail(mailOptions);
                }
            } catch (emailErr) {
                console.error('Error sending pickup notification email:', emailErr);
            }
        })();

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

module.exports = router; 