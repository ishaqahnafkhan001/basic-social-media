const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");

// 1. Import Cloudinary Upload Middleware
const { upload } = require("../config/cloudinary");

// 2. Import Review Router for nested reviews
const reviewRouter = require("./reviews"); // Adjust path if needed
// const { createSubscription } = require('../controllers/payment/payment');

const {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    loginUser,
    getId
} = require("../controllers/users");

// ==============================
// NESTED ROUTES
// ==============================
// GET /api/users/:userId/reviews
router.use('/:userId/reviews', reviewRouter);

// ==============================
// AUTH ROUTES
// ==============================
router.post("/login", loginUser);

// Register - No image upload here (JSON only)
router.post("/", createUser);

// ==============================
// USER ROUTES
// ==============================

// 1. Static Routes (Must come BEFORE /:id)
router.get("/id", authMiddleware, getId);
router.get("/", authMiddleware, getUsers);

// 2. Dynamic Routes
router.get("/:id", authMiddleware, getUser);

// UPDATE - Add 'upload.single' here!
// This allows formData with an image file named 'profilePicture'
router.put("/:id", authMiddleware, upload.single('profilePicture'), updateUser);

router.delete("/:id", authMiddleware, deleteUser);

// Changed from createVerificationIntent to createSubscription
// router.post("/create-subscription", authMiddleware, (req, res) => {
//     // 🔴 SAFETY FIX: If req.body is undefined, make it an empty object
//     if (!req.body) {
//         req.body = {};
//     }
//
//     // Now this line is safe
//     req.body.userId = req.user.id;
//
//     createSubscription(req, res);
// });
module.exports = router;