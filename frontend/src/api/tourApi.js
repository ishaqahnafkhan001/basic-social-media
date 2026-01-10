import api from "./axiosClient";

const tourApi = {
    // ==============================
    // PUBLIC ROUTES
    // ==============================

    // GET /api/tours?page=1&limit=10&minPrice=500...
    getAll: (params) => api.get("/tours", { params }),

    // GET /api/tours/:id
    getById: (id) => api.get(`/tours/${id}`),

    // ==============================
    // PROTECTED / AGENCY ROUTES
    // ==============================

    // POST /api/tours/:id/reviews
    addReview: (tourId, reviewData) => api.post(`/tours/${tourId}/reviews`, reviewData),

    // GET /api/tours/agency/my-tours?page=1
    // Updated to accept params for pagination in your dashboard
    getMyTours: (params) => api.get("/tours/agency/my-tours", { params }),

    // POST /api/tours
    create: (data) => api.post("/tours", data),

    // PUT /api/tours/:id
    update: (id, data) => api.put(`/tours/${id}`, data),

    // DELETE /api/tours/:id
    remove: (id) => api.delete(`/tours/${id}`),
};

export default tourApi;