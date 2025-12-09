import api from "./axiosClient";

const postApi = {
    // PUBLIC
    getAll: () => api.get("/posts"),

    // ONE POST
    getById: (id) => api.get(`/posts/${id}`),

    // CREATE
    create: (data) => api.post("/posts", data),

    // UPDATE
    update: (id, data) => api.put(`/posts/${id}`, data),

    // DELETE
    remove: (id) => api.delete(`/posts/${id}`),

    // 🔥 IMPORTANT: Get posts of specific user
    getPostsByUser: (userId) => api.get(`/posts/user/${userId}`),

    toggleLike: (postId) => api.put(`/posts/like/${postId}`)

};

export default postApi;
