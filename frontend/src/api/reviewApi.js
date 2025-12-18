import api from "./axiosClient";

const reviewApi = {
    // ==============================
    // TOUR REVIEWS
    // ==============================

    // GET /api/tours/:tourId/reviews
    getAllByTour: (tourId) => api.get(`/tours/${tourId}/reviews`),

    // POST /api/tours/:tourId/reviews
    createForTour: (tourId, payload) => api.post(`/tours/${tourId}/reviews`, payload),

    // ==============================
    // USER / AGENCY REVIEWS (NEW)
    // ==============================

    // GET /api/users/:userId/reviews
    // (Ensure your backend has this route, or use /reviews?user=ID)
    getAllByUser: (userId) => api.get(`/users/${userId}/reviews`),

    // POST /api/users/:userId/reviews
    createForUser: (userId, payload) => api.post(`/users/${userId}/reviews`, payload),

    // ==============================
    // GENERAL
    // ==============================

    // DELETE /api/reviews/:id
    remove: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export default reviewApi;