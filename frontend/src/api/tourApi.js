import api from "./axiosClient";

const tourApi = {
    // ==============================
    // PUBLIC ROUTES
    // ==============================

    // GET /api/tours
    getAll: (params) => api.get("/tours", { params }),

    // GET /api/tours/:id
    getById: (id) => api.get(`/tours/${id}`),

    // ==============================
    // REVIEW ROUTES (New)
    // ==============================

    // POST /api/tours/:id/reviews
    // (Or /api/reviews depending on how you mounted the route)
    // This assumes you set up the nested route I suggested earlier
    addReview: (tourId, reviewData) => api.post(`/tours/${tourId}/reviews`, reviewData),

    // ==============================
    // AGENCY ROUTES (Protected)
    // ==============================

    // GET /api/tours/agency/my-tours
    getMyTours: () => api.get("/tours/agency/my-tours"),

    // POST /api/tours
    create: (data) => api.post("/tours", data),

    // PUT /api/tours/:id
    // (Updated comment: Backend uses PUT)
    update: (id, data) => api.put(`/tours/${id}`, data),

    // DELETE /api/tours/:id
    remove: (id) => api.delete(`/tours/${id}`),
};

export default tourApi;