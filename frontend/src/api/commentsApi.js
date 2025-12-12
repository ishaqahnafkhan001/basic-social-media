// src/api/commentsApi.js
import api from "./axiosClient";

const commentsApi = {
    getByPostId: (postId) => api.get(`/comments/${postId}`),
    create: (postId, data) => api.post(`/comments/${postId}`, data), // { comment: "text" }
    remove: (commentId) => api.delete(`/comments/${commentId}`)
};

export default commentsApi;
