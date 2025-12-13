const express = require('express');
const router = express.Router();

// Import the controller functions
const {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getMyTours
} = require('../controllers/tour/tour');

// Import Middleware
// (Assuming you have these. If not, I can create them for you)
const { authMiddleware, isAgency } = require('../middleware/auth');

// ==============================
// PUBLIC ROUTES (No login needed)
// ==============================

// GET /api/tours 
// (Gets all tours, with pagination & filters)
router.get('/', getAllTours);

// ==============================
// PROTECTED ROUTES (Login Required)
// ==============================

// GET /api/tours/agency/my-tours
// Get all tours belonging to the currently logged-in agency
// NOTE: This must be defined BEFORE /:id to avoid conflicts
router.get('/agency/my-tours', authMiddleware, isAgency, getMyTours);

// GET /api/tours/:id
// (Get single tour details - Public, but defined here to keep order clean)
router.get('/:id', getTourById);

// POST /api/tours
// (Create a new tour - Only Agencies)
router.post('/', authMiddleware, isAgency, createTour);

// PATCH /api/tours/:id
// (Update a tour - Only the Owner Agency)
router.put('/:id', authMiddleware, isAgency, updateTour);

// DELETE /api/tours/:id
// (Delete a tour - Only the Owner Agency)
router.delete('/:id', authMiddleware, isAgency, deleteTour);

module.exports = router;