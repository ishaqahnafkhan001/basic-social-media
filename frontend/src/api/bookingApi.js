import api from "./axiosClient";

const bookingApi = {
    // 1. Create a Booking (Initial Pending State)
    create: (data) => api.post("/bookings", data),

    // 2. Stripe: Create Checkout Session
    // Sends the bookingId to backend to generate a Stripe payment URL
    createCheckoutSession: (bookingId) => api.post("/bookings/create-checkout-session", { bookingId }),

    // 3. Stripe: Verify Payment (Sandbox/Localhost flow)
    // Sends the session_id from URL to backend to confirm payment
    verifyPayment: (sessionId) => api.post("/bookings/verify-payment", { session_id: sessionId }),

    // 4. Get Current User's Bookings
    getMyBookings: () => api.get("/bookings/my-bookings"),

    // 5. Get Single Booking by ID
    getById: (id) => api.get(`/bookings/${id}`),

    // 6. Cancel Booking
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export default bookingApi;