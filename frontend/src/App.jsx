import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 1. Remove standard imports and use lazy imports
// This tells React: "Wait to download this file until we actually need it."
const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));
const BlogDashboard = lazy(() => import("./pages/BlogDashboard.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const AllBlogs = lazy(() => import("./pages/AllBlogs.jsx"));
const CreateBlog = lazy(() => import("./pages/CreateBlog.jsx"));
const CreateTour = lazy(() => import("./pages/CreateTour.jsx"));
const MyCreatedTour = lazy(() => import("./pages/Tour.jsx"));
const UpdateTour = lazy(() => import("./pages/UpDateTour.jsx"));
const MainDash = lazy(() => import("./pages/MainDash.jsx"));
const TourDetail = lazy(() => import("./pages/TourDetail.jsx"));
const Booking = lazy(() => import("./pages/Booking.jsx"));
const Request = lazy(() => import("./pages/Request.jsx"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess.jsx"));
const MyBookings = lazy(() => import("./pages/MyBooking.jsx"));

// Keep ProtectedRoute as a standard import because it wraps others
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

// 2. Create a simple Loading component (or import one)
const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

export default function App() {
    return (
        <>
            <Toaster position="top-center" />

            <BrowserRouter>
                {/* 3. Wrap Routes in Suspense to handle the "loading" state */}
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Auth */}
                        <Route path="/auth" element={<AuthPage />} />

                        {/* Dashboard */}
                        <Route path="/dashboard" element={<ProtectedRoute><MainDash /></ProtectedRoute>} />

                        {/* Blogs */}
                        <Route path="/blog/myBlogs" element={<ProtectedRoute><BlogDashboard /></ProtectedRoute>} />
                        <Route path="/blog/all-blogs" element={<ProtectedRoute><AllBlogs /></ProtectedRoute>} />
                        <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />

                        {/* User */}
                        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                        {/* Tours */}
                        <Route path="/create-tour" element={<ProtectedRoute><CreateTour /></ProtectedRoute>} />
                        <Route path="/tours/my-tours" element={<ProtectedRoute><MyCreatedTour /></ProtectedRoute>} />
                        <Route path="/update-tour/:id" element={<ProtectedRoute><UpdateTour /></ProtectedRoute>} />

                        {/* Public Tour Detail (Often users allow public viewing, but you have it protected) */}
                        <Route path="/tours/:id" element={<ProtectedRoute><TourDetail /></ProtectedRoute>} />
                        <Route path="/tours/:id/book" element={<ProtectedRoute><Booking /></ProtectedRoute>} />

                        {/* Agency/Admin Requests */}
                        <Route path="/request" element={<ProtectedRoute><Request /></ProtectedRoute>} />

                        {/* Booking & Payments */}
                        <Route path="/checkout-success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
                        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

                        {/* Fallback */}
                        <Route path="*" element={<AuthPage />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </>
    );
}