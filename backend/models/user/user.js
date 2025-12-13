const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    // --- Identity ---
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String, // Note: Ensure this is hashed before saving!
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'agency'],
        default: 'user',
        required: true
    },
    profilePictureUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        maxlength: 500 // Good practice to limit bio length
    },

    // --- Contact & Location (Important for Tours) ---
    phoneNumber: {
        type: String,
        required: false
    },
    address: {
        city: String,
        country: String
    },

    // --- Personalization ---
    favoriteTourCategories: [{
        type: String,
        // Example: ['Hiking', 'Beach', 'Historical']
        trim: true
    }],

    // --- Rating System ---
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },

    // --- Verification & Security ---
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationData: {
        status: {
            type: String,
            enum: ['unverified', 'pending', 'verified', 'rejected'],
            default: 'unverified'
        },
        subscriptionExpiresAt: {
            type: Date // To track the monthly payment status
        },
        documentType: {
            type: String,
            enum: ['nid', 'passport', 'other']
        },
        documentNumber: String, // The ID number on the card
        documentUrl: String // URL to the image of the ID stored in cloud (AWS S3/Cloudinary)
    },

    // --- Social Links (Optional but good for Agencies) ---
    socialLinks: {
        facebook: String,
        instagram: String,
        website: String
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// --- Joi Validation Schema ---
const validateUser = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('user', 'agency', 'admin').optional(),

        // Optional Profile Updates
        profilePictureUrl: Joi.string().uri().allow('').optional(),
        description: Joi.string().max(500).allow('').optional(),
        phoneNumber: Joi.string().min(5).allow('').optional(),

        // Location
        address: Joi.object({
            city: Joi.string().allow(''),
            country: Joi.string().allow('')
        }).optional(),

        // Preferences
        favoriteTourCategories: Joi.array().items(Joi.string()).optional(),

        // Verification (Usually handled in a separate update, but allowed here)
        verificationData: Joi.object({
            documentType: Joi.string().valid('nid', 'passport', 'other'),
            documentNumber: Joi.string(),
            documentUrl: Joi.string().uri()
        }).optional(),

        socialLinks: Joi.object({
            facebook: Joi.string().uri().allow(''),
            instagram: Joi.string().uri().allow(''),
            website: Joi.string().uri().allow('')
        }).optional()
    });

    return schema.validate(data);
};

const User = mongoose.model('User', userSchema);

module.exports = { User, validateUser };