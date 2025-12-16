import api from "./axiosClient";

const reviewApi = {
    // ==============================
    // PUBLIC ROUTES
    // ==============================

    // GET /api/tours/:tourId/reviews
    // Fetch all reviews for a specific tour
    getAllByTour: (tourId) => api.get(`/tours/${tourId}/reviews`),

    // ==============================
    // PROTECTED ROUTES (Login Required)
    // ==============================

    // POST /api/tours/:tourId/reviews
    // Add a review to a tour
    // payload should be: { rating: 5, review: "Great trip!" }
    create: (tourId, payload) => api.post(`/tours/${tourId}/reviews`, payload),

    // DELETE /api/reviews/:id
    // Delete a review (User deletes their own, or Admin deletes any)
    // Note: This endpoint is usually direct, not nested under tours
    remove: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export default reviewApi;