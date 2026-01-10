const mongoose = require('mongoose');
const Joi = require('joi');

const bookingSchema = new mongoose.Schema({
    // --- Relationships ---
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // NEW: Link to the Agency who owns the tour
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Change to 'Agency' if your agency model is separate from User
        required: true
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },

    // --- Trip Details ---
    tourName: { type: String, required: true },
    bookAt: {
        type: Date,
        required: true
    },

    // --- Guest Info ---
    guestSize: {
        type: Number,
        required: true,
        min: 1
    },
    guestDetails: [{
        fullName: String,
        age: Number
    }],

    // --- Contact Snapshot ---
    contactInfo: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },

    // --- Financials ---
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'usd'
    },

    // --- Status Tracking ---
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: { type: String }

}, {
    timestamps: true
});

// --- Joi Validation ---
const validateBooking = (data) => {
    const schema = Joi.object({
        tourId: Joi.string().required(),
        // NEW: Validate the Agency ID (The controller will usually pass this)
        agencyId: Joi.string().required(),

        bookAt: Joi.date().required(),
        guestSize: Joi.number().min(1).required(),
        totalAmount: Joi.number().required(),

        fullName: Joi.string().required(),
        phone: Joi.string().required(),

        guestDetails: Joi.array().items(
            Joi.object({
                fullName: Joi.string().required(),
                age: Joi.number().allow('').optional(),
                phone: Joi.string().allow('').optional()
            })
        ).optional(),

        userEmail: Joi.string().email(),
        tourName: Joi.string().optional()
    });

    return schema.validate(data);
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Booking, validateBooking };