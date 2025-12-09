const express = require('express');
const router = express.Router();
const {
    createComment,
    getPostComments,
    deleteComment
} = require('../controllers/comment');

// Middleware to check if user is logged in
// Replace 'middleware/auth' with your actual auth middleware file path
const { authMiddleware } = require('../middleware/auth');


router.post('/:postId',authMiddleware, createComment);

// 2. Get all comments for a specific post
// Usage: GET /api/comments/64f8a... (Post ID)
router.get('/:postId', getPostComments);

// 3. Delete a specific comment
// Usage: DELETE /api/comments/64f8a... (Comment ID)
router.delete('/:commentId', authMiddleware, deleteComment);

module.exports = router;