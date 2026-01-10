const express = require('express');
const router = express.Router();
const reviewRouter = require('./reviews'); // Import your review routes
const { uploadTour } = require('../config/cloudinary');
// Import the controller functions
const {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getMyTours
} = require('../controllers/tour/tour');
const tourUploads = uploadTour.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 6 }
]);

const { authMiddleware, isAgency } = require('../middleware/auth');


router.get('/', getAllTours);


router.get('/agency/my-tours', authMiddleware, isAgency, getMyTours);

router.get('/:id', getTourById);

router.post('/', authMiddleware, isAgency, tourUploads, createTour);

router.put('/:id', authMiddleware, isAgency, tourUploads, updateTour);

router.delete('/:id', authMiddleware, isAgency, deleteTour);

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;