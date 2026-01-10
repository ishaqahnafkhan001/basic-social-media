const express = require('express');
const router = express.Router();
const { authMiddleware, isAgency } = require('../middleware/auth'); // Assuming you have these
const bookingController = require('../controllers/booking/booking');

// User Routes
router.post('/', authMiddleware, bookingController.createBooking);
router.get('/my-bookings', authMiddleware, bookingController.getMyBookings);
router.get('/:id', authMiddleware, bookingController.getBooking);
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking);

// Add these routes
router.post('/create-checkout-session', authMiddleware, bookingController.getCheckoutSession);
router.post('/verify-payment', authMiddleware, bookingController.verifyPayment);
// Admin Routes
router.get('/', authMiddleware, isAgency, bookingController.getAllBookings);

module.exports = router;