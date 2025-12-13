import api from "./axiosClient";

const userApi = {
    // --- AUTHENTICATION ---

    // REGISTER (Create User)
    // Matches: router.post("/", createUser)
    register: (data) => api.post("/users", data),

    // LOGIN
    // Matches: router.post("/login", loginUser)
    login: (data) => api.post("/users/login", data),

    // GET CURRENT USER (From Token)
    // Matches: router.get("/id", authMiddleware, getId)
    getMe: () => api.get("/users/id"),


    // --- USER MANAGEMENT ---

    // GET ALL USERS (Can pass params like { role: 'agency' })
    // Matches: router.get("/", authMiddleware, getUsers)
    getAll: (params) => api.get("/users", { params }),

    // GET SINGLE USER BY ID
    // Matches: router.get("/:id", authMiddleware, getUser)
    getById: (id) => api.get(`/users/${id}`),

    // UPDATE USER
    // Matches: router.put("/:id", authMiddleware, updateUser)
    update: (id, data) => api.put(`/users/${id}`, data),

    // DELETE USER
    // Matches: router.delete("/:id", authMiddleware, deleteUser)
    remove: (id) => api.delete(`/users/${id}`),
};

export default userApi;