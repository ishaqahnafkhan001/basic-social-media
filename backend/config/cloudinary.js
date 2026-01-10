const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- STORAGE 1: FOR USER PROFILES (Square, Face Focus) ---
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wander_go/users',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" }, // Smart Face Crop
            { quality: "auto", fetch_format: "auto" }
        ]
    }
});

// --- STORAGE 2: FOR TOURS (Landscape, Scenery, No Face Crop) ---
const tourStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wander_go/tour', // Separate folder
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: "limit" }, // Resize but keep aspect ratio
            { quality: "auto", fetch_format: "auto" }
        ]
    }
});

// Export both
const uploadProfile = multer({ storage: profileStorage });
const uploadTour = multer({ storage: tourStorage });

module.exports = { cloudinary, uploadProfile, uploadTour };