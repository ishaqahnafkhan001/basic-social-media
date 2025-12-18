import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AuthPage from "./pages/AuthPage.jsx";
import BlogDashboard from "./pages/BlogDashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Profile from "./pages/Profile.jsx";
import AllBlogs from "./pages/AllBlogs.jsx";
import CreateBlog from "./pages/CreateBlog.jsx";
import CreateTour from "./pages/CreateTour.jsx";
import MyCreatedTour from "./pages/Tour.jsx";
import UpdateTour from "./pages/UpDateTour.jsx";
import MainDash from "./pages/MainDash.jsx";
import TourDetail from "./pages/TourDetail.jsx";
import Booking from "./pages/Booking.jsx";
import Request from "./pages/Request.jsx";

export default function App() {
    return (
        <>
            <Toaster position="top-center" />

            <BrowserRouter>
                <Routes>

                    {/* Auth */}
                    <Route path="/auth" element={<AuthPage />} />

                    {/* Blogs */}
                    <Route path="/blog/myBlogs" element={<ProtectedRoute><BlogDashboard /></ProtectedRoute>} />
                    <Route path="/blog/all-blogs" element={<ProtectedRoute><AllBlogs /></ProtectedRoute>} />

                    {/* User */}
                    <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                    {/* Dashboard */}
                    <Route path="/dashboard" element={<ProtectedRoute><MainDash /></ProtectedRoute>} />

                    {/* Blog Create */}
                    <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />

                    {/* Tour */}
                    <Route path="/create-tour" element={<ProtectedRoute><CreateTour /></ProtectedRoute>} />
                    <Route path="/tours/my-tours" element={<ProtectedRoute><MyCreatedTour /></ProtectedRoute>} />
                    <Route path="/update-tour/:id" element={<ProtectedRoute><UpdateTour /></ProtectedRoute>} />
                    <Route path="/tours/:id" element={<ProtectedRoute><TourDetail /></ProtectedRoute>} />
                    <Route path="/tours/:id/book" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                    <Route path="/request" element={<ProtectedRoute><Request /></ProtectedRoute>} />
                    {/* Fallback */}
                    <Route path="*" element={<AuthPage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}
