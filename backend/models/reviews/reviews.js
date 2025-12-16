const mongoose = require('mongoose');
const Joi = require('joi');
const { Tour } = require('../tour/tour'); // Import Tour to update stats

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
    // Parent Referencing
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
}, {
    timestamps: true
});

// PREVENT DUPLICATE REVIEWS
// A user can only write one review per tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// --- STATIC METHOD: Calculate Average Rating ---
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        // Reset if no reviews exist
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 0 // or 4.5 default
        });
    }
};

// Update stats after saving a new review
reviewSchema.post('save', function() {
    // this.constructor points to the Model (Review)
    this.constructor.calcAverageRatings(this.tour);
});

// Update stats after updating/deleting a review (Advanced Mongoose)
// (Optional - requires specific Query Middleware setup)

const Review = mongoose.model('Review', reviewSchema);

// --- JOI VALIDATION FOR REVIEW ---
function validateReview(data) {
    const schema = Joi.object({
        review: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required(),
        tour: Joi.string().required(), // The Tour ID
        user: Joi.string().required()  // The User ID
    });
    return schema.validate(data);
}

module.exports = { Review, validateReview };