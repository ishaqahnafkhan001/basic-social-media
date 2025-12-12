import api from "./axiosClient.js"; // Import your configured axios instance

const BASE_PATH = "/users"; // Change this if your backend mounts the route differently

const userApi = {
    // REGISTER (router.post("/", ...))
    register: async (userData) => {
        const response = await api.post(`${BASE_PATH}/`, userData);
        return response.data;
    },

    // LOGIN (router.post("/login", ...))
    login: async (credentials) => {
        return await api.post(`${BASE_PATH}/login`, credentials) ;
    },

    // GET CURRENT USER INFO (router.get("/id", ...))
    // Usually used to validate token and get user details on page reload
    getMe: async () => {
        const response = await api.get(`${BASE_PATH}/id`);
        return response.data;
    },

    // GET ALL USERS (router.get("/", ...))
    getAllUsers: async () => {
        const response = await api.get(`${BASE_PATH}/`);
        return response.data;
    },

    // GET SINGLE USER BY ID (router.get("/:id", ...))
    getUserById: async (id) => {
        const response = await api.get(`${BASE_PATH}/${id}`);
        return response.data;
    },

    // UPDATE USER (router.put("/:id", ...))
    updateUser: async (id, data) => {
        const response = await api.put(`${BASE_PATH}/${id}`, data);
        return response.data;
    },

    // DELETE USER (router.delete("/:id", ...))
    deleteUser: async (id) => {
        const response = await api.delete(`${BASE_PATH}/${id}`);
        return response.data;
    },
};

export default userApi;