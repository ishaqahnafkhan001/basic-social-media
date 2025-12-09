const express = require('express');
const router = express.Router();
const {
    createComment,
    getPostComments,
    deleteComment
} = require('../controllers/comment');

// Middleware to check if user is logged in
// Replace 'middleware/auth' with your actual auth middleware file path
const { protect } = require('../middleware/auth');

// 1. Add a comment to a specific post
// Usage: POST /api/comments/64f8a... (Post ID)
router.post('/:postId', protect, createComment);

// 2. Get all comments for a specific post
// Usage: GET /api/comments/64f8a... (Post ID)
router.get('/:postId', getPostComments);

// 3. Delete a specific comment
// Usage: DELETE /api/comments/64f8a... (Comment ID)
router.delete('/:commentId', protect, deleteComment);

module.exports = router;