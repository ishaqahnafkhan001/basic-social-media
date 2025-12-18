const { Review, validateReview } = require('../../models/reviews/reviews');
const { Tour } = require('../../models/tour/tour');
const { User } = require('../../models/user/user');

// --- 1. CREATE REVIEW ---
const createReview = async (req, res) => {
    try {
        const tourId = req.params.tourId || req.body.tour;
        const targetUserId = req.params.userId || req.body.targetUser;

        if (!tourId && !targetUserId) {
            return res.status(400).json({ message: "Review must target a Tour or a User." });
        }

        const reviewData = {
            review: req.body.review,
            rating: req.body.rating,
            user: req.user.id,
        };

        if (tourId) reviewData.tour = tourId;
        if (targetUserId) reviewData.targetUser = targetUserId;

        const { error } = validateReview(reviewData);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Create the review
        let newReview = await Review.create(reviewData);

        // 🔥 CRITICAL FIX: Populate the user immediately after creation
        // so the frontend receives { user: { name: "..." } } instead of { user: "ID" }
        newReview = await newReview.populate({
            path: 'user',
            select: 'name profilePictureUrl'
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: newReview
        });

    } catch (err) {

        res.status(500).json({ message: "Internal server error" });
    }
};

// --- 2. GET REVIEWS ---
const getReviews = async (req, res) => {
    try {
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        if (req.params.userId) filter = { targetUser: req.params.userId };

        const reviews = await Review.find(filter)
            .populate({
                path: 'user', // <--- This turns the ID string into an Object
                select: 'name profilePictureUrl'
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            results: reviews.length,
            data: reviews
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- 3. DELETE REVIEW ---
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized." });
        }

        await Review.findByIdAndDelete(req.params.id);

        // Update stats
        if (review.tour) await Review.calcAverageRatings(review.tour, 'tour');
        else if (review.targetUser) await Review.calcAverageRatings(review.targetUser, 'user');

        res.json({ success: true, message: "Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { createReview, getReviews, deleteReview };