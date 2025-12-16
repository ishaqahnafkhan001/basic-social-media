const { Review, validateReview } = require('../../models/reviews/reviews');
const { Tour } = require('../../models/tour/tour'); // Adjust path to your Tour model
const { User } = require('../../models/user/user'); // Adjust path to your User model

// --- 1. CREATE REVIEW ---
const createReview = async (req, res) => {
    try {
        // 1. Prepare Data
        // If the tour ID is in the URL (e.g., /tours/:tourId/reviews), use it.
        // Otherwise, look for it in the body.
        const tourId = req.body.tour || req.params.tourId;
        const userId = req.user.id; // From authMiddleware

        // Construct the data object for validation and creation
        const reviewData = {
            review: req.body.review,
            rating: req.body.rating,
            tour: tourId,
            user: userId
        };

        // 2. Validate
        const { error } = validateReview(reviewData);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // 3. Check if Tour exists
        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        // 4. Create & Save
        // Note: The 'post save' hook in the Review model will automatically
        // recalculate the average rating for the Tour.
        const newReview = await Review.create(reviewData);

        res.status(201).json({
            message: "Review submitted successfully",
            data: newReview
        });

    } catch (err) {
        // Handle Duplicate Review Error (MongoDB code 11000)
        if (err.code === 11000) {
            return res.status(409).json({ message: "You have already reviewed this tour." });
        }
        console.error("Create Review Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- 2. GET ALL REVIEWS (Usually for a specific Tour) ---
const getReviews = async (req, res) => {
    try {
        let filter = {};
        // If tourId is provided in params, filter by it
        if (req.params.tourId) filter = { tour: req.params.tourId };

        const reviews = await Review.find(filter)
            .populate({
                path: 'user',
                select: 'name profilePictureUrl' // Only get name and image of reviewer
            })
            .sort({ createdAt: -1 }); // Newest first

        res.json({
            results: reviews.length,
            data: reviews
        });

    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- 3. DELETE REVIEW ---
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check Permissions:
        // Only the author OR an admin can delete
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to delete this review." });
        }

        await Review.findByIdAndDelete(req.params.id);

        // IMPORTANT: We must trigger the calculation again manually or use findOneAndDelete middleware
        // Ideally, call the static method on the Model to update stats
        await Review.calcAverageRatings(review.tour);

        res.json({ message: "Review deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createReview,
    getReviews,
    deleteReview
};