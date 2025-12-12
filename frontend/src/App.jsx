import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AuthPage from "./pages/AuthPage.jsx";
import BlogDashboard from "./pages/BlogDashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Profile from "./pages/Profile.jsx";
import AllBlogs from "./pages/AllBlogs.jsx";

export default function App() {
    return (
        <>
            <Toaster position="top-center" />

            <BrowserRouter>
                <Routes>
                    {/* Auth Page */}
                    <Route path="/auth" element={<AuthPage />} />

                    {/* Protected Dashboard */}
                    <Route
                        path="/blog"
                        element={
                            <ProtectedRoute>
                                <BlogDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/all-blogs"
                        element={
                            <ProtectedRoute>
                                <AllBlogs />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Redirect */}
                    <Route path="*" element={<AuthPage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}
