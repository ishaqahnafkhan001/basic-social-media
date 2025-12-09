import api from "./axiosClient";

const authApi = {
    register: (data) => api.post("/users", data),
    login: (data) => api.post("/users/login", data),
    id: (data) => api.get("/users/id",data),  // protected
};

export default authApi;
