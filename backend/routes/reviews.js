const express = require('express');
const router = express.Router({ mergeParams: true }); // Important to access :tourId from parent router
const { authMiddleware } = require('../middleware/auth');
const { createReview, getReviews, deleteReview } = require('../controllers/reviews/reviews');

// GET /api/reviews OR /api/tours/:tourId/reviews
router.get('/', getReviews);

// POST /api/tours/:tourId/reviews
router.post('/', authMiddleware, createReview);

// DELETE /api/reviews/:id
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;