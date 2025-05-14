const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const path = require('path');

// Create GridFS storage engine
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            bucketName: 'uploads',
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});

// Create multer upload instance
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
        }
    }
});

// POST /api/uploads - Upload a single image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Return the file ID and URL
        res.json({
            success: true,
            fileId: req.file.id,
            filename: req.file.filename,
            url: `/api/uploads/${req.file.id}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file'
        });
    }
});

// GET /api/uploads/:id - Get image by ID
router.get('/:id', async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const downloadStream = bucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }
});

module.exports = router; 