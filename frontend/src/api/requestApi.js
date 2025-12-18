import api from "./axiosClient";

const requestApi = {
    // ==============================
    // USER ROUTES
    // ==============================

    // 1. Start Subscription
    // 🔴 FIX: Add {} as the second argument here
    createSubscription: () => api.post("/users/create-subscription", {}),

    // 2. Submit Final Request
    create: (formData) => {
        return api.post("/requests", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // ... other routes
    getAll: (params) => api.get("/requests", { params }),
    updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
};

export default requestApi;