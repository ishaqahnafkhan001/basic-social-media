const mongoose = require('mongoose');
const Joi = require('joi');

const verificationRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // --- Contact Details Snapshot ---
    phoneNumber: { type: String, required: true },
    address: {
        city: String,
        country: String
    },

    // --- Document Details ---
    documentType: {
        type: String,
        enum: ['nid', 'passport', 'other'],
        required: true
    },
    documentNumber: { type: String, required: true },
    documentImageUrl: { type: String, required: true }, // Cloudinary URL

    // --- Payment Info ---
    stripeSubscriptionId: { type: String }, // To track the recurring payment

    // --- Status ---
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminResponse: { type: String }, // Reason for rejection, etc.
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

// Joi Validation
const validateVerificationRequest = (data) => {
    const schema = Joi.object({
        phoneNumber: Joi.string().required(),
        address: Joi.object({
            city: Joi.string().required(),
            country: Joi.string().required()
        }).required(),
        documentType: Joi.string().valid('nid', 'passport', 'other').required(),
        documentNumber: Joi.string().required(),
        stripeSubscriptionId: Joi.string().optional(),
        // Note: Image is validated by Multer presence check in controller
    });
    return schema.validate(data);
};

module.exports = { VerificationRequest, validateVerificationRequest };