const mongoose = require('mongoose');
const Joi = require('joi');
const { Tour } = require('../tour/tour');
const { User } = require('../user/user');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    // --- LINKING FIELDS ---
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: false
    },
    targetUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    },

    // The Author
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
}, {
    timestamps: true
});

// --- INDEXES (UPDATED) ---
// We removed "unique: true".
// We keep simple indexes so fetching reviews remains fast.

reviewSchema.index({ tour: 1 });       // Fast lookup for Tour reviews
reviewSchema.index({ targetUser: 1 }); // Fast lookup for Agency reviews
reviewSchema.index({ user: 1 });       // Fast lookup for "My Reviews"

// --- STATIC METHOD: Calculate Stats ---
reviewSchema.statics.calcAverageRatings = async function(targetId, type) {
    const Model = type === 'tour' ? Tour : User;
    const matchField = type === 'tour' ? 'tour' : 'targetUser';

    const stats = await this.aggregate([
        {
            $match: { [matchField]: targetId }
        },
        {
            $group: {
                _id: `$${matchField}`,
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Model.findByIdAndUpdate(targetId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: Math.round(stats[0].avgRating * 10) / 10
        });
    } else {
        await Model.findByIdAndUpdate(targetId, {
            ratingsQuantity: 0,
            ratingsAverage: 0
        });
    }
};

// --- HOOKS ---
reviewSchema.post('save', function() {
    if (this.tour) {
        this.constructor.calcAverageRatings(this.tour, 'tour');
    } else if (this.targetUser) {
        this.constructor.calcAverageRatings(this.targetUser, 'user');
    }
});

reviewSchema.post(/^findOneAnd/, async function(doc) {
    if (doc) {
        if (doc.tour) {
            await doc.constructor.calcAverageRatings(doc.tour, 'tour');
        } else if (doc.targetUser) {
            await doc.constructor.calcAverageRatings(doc.targetUser, 'user');
        }
    }
});

const Review = mongoose.model('Review', reviewSchema);

// --- JOI VALIDATION ---
function validateReview(data) {
    const schema = Joi.object({
        review: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required(),
        tour: Joi.string().optional(),
        targetUser: Joi.string().optional(),
        user: Joi.string().required()
    }).or('tour', 'targetUser');

    return schema.validate(data);
}

module.exports = { Review, validateReview };