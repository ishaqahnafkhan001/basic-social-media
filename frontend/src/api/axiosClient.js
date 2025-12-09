import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Automatically attach Bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Global error handler
api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API Error:", err.response?.data || err.message);
        return Promise.reject(err);
    }
);

export default api;
