import api from "./axiosClient";

const tourApi = {
    // ==============================
    // PUBLIC ROUTES
    // ==============================

    // GET /api/tours (Get all tours with optional filters/pagination)
    getAll: (params) => api.get("/tours", { params }),

    // GET /api/tours/:id (Get single tour details)
    getById: (id) => api.get(`/tours/${id}`),

    // ==============================
    // AGENCY ROUTES (Protected)
    // ==============================

    // GET /api/tours/agency/my-tours (Get tours belonging to logged-in agency)
    getMyTours: () => api.get("/tours/agency/my-tours"),

    // POST /api/tours (Create a new tour)
    create: (data) => api.post("/tours", data),

    // PATCH /api/tours/:id (Update a tour - Backend uses PATCH)
    update: (id, data) => api.put(`/tours/${id}`, data),

    // DELETE /api/tours/:id (Delete a tour)
    remove: (id) => api.delete(`/tours/${id}`),
};

export default tourApi;