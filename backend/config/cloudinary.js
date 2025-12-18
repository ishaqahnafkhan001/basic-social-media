const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config(); // Load .env variables

// 1. Configure Cloudinary Credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Storage Engine with Optimization
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wander_go/WanderGo_user_profile', // Your requested folder
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],

        // --- OPTIMIZED TRANSFORMATION ---
        transformation: [
            { width: 800, height: 800, crop: "thumb", gravity: "face" }, // Smart Face Cropping
            { quality: "auto", fetch_format: "auto" } // Auto-format & Compression
        ]
    }
});

// 3. Initialize Multer
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };