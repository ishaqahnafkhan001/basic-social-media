import api from "./axiosClient";

const userApi = {
    // --- AUTHENTICATION ---

    // REGISTER (JSON Only - Removed image upload support as requested)
    register: (data) => api.post("/users", data),

    // LOGIN
    login: (data) => api.post("/users/login", data),

    // GET CURRENT USER
    getMe: () => api.get("/users/id"),


    // --- USER MANAGEMENT ---

    // GET ALL USERS
    getAll: (params) => api.get("/users", { params }),

    // GET SINGLE USER
    getById: (id) => api.get(`/users/${id}`),

    // UPDATE USER (Supports JSON or FormData for Images)
    // Matches: router.put("/:id", authMiddleware, upload.single('profilePicture'), updateUser)
    update: (id, data) => {
        // If we are sending a file (FormData), we let the browser set the Content-Type
        // to ensure the correct 'boundary' is added.
        const config = data instanceof FormData
            ? { headers: { "Content-Type": undefined } }
            : {};

        return api.put(`/users/${id}`, data, config);
    },

    // DELETE USER
    remove: (id) => api.delete(`/users/${id}`),
};

export default userApi;