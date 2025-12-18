const express = require("express");
const router = express.Router();
const { authMiddleware  } = require("../middleware/auth"); // Assuming you have these
const { upload } = require("../config/cloudinary"); // Your Multer/Cloudinary config

const {
    createRequest,
    getAllRequests,
    updateRequestStatus
} = require("../controllers/requests");

// 1. Submit a Request (User) - Needs Image Upload
// Use 'profilePicture' key if that's what your frontend sends,
// OR 'documentImage' if you updated the frontend logic.
// Based on previous conversation, let's accept 'profilePicture' to match frontend.
router.post("/", authMiddleware, upload.single('profilePicture'), createRequest);

// 2. Get All Requests (Admin)
router.get("/", authMiddleware,  getAllRequests);

// 3. Approve/Reject Request (Admin)
router.put("/:id/status", authMiddleware,  updateRequestStatus);

module.exports = router;