import api from "./axiosClient";

const bookingApi = {
    create: (data) => api.post("/bookings", data),
    // Future: getMyBookings, cancelBooking, etc.
};

export default bookingApi;