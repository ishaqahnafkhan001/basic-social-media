import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { motion } from "framer-motion";
import postApi from "../api/postApi.js";

// Hooks & Components
import usePosts from "../hooks/usePosts";
import useUser from "../hooks/userInfo";
import Sidebar from "../components/layout/Sidebar.jsx";
import Nav from "../components/nav/Nav.jsx";
import PostForm from "../components/posts/PostForm";

export default function CreateBlog() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we were sent here with a post to edit (passed via state)
    const initialPost = location.state?.post || null;
    const isEditing = !!initialPost;

    const { createPost, updatePost } = usePosts();
    const { role } = useUser() || { role: "user" };

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // --- Handlers ---
    const handleSubmit = async (data) => {
        let success;

        if (isEditing) {
            success = await postApi.update(initialPost._id, data);
        } else {
            success = await postApi.create(data);
        }

        if (success) {
            // Navigate back to blog list after success
            navigate("/blog/myBlogs");
        }
    };

    const handleCancel = () => {
        navigate("/blog/myBlogs");
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            {/* Top Navigation */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <Nav cartCount={0} userRole={role} />
            </div>

            <div className="flex flex-1 max-w-[1920px] mx-auto w-full relative">

                {/* Mobile Sidebar Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed md:sticky top-0 h-screen md:h-[calc(100vh-80px)] z-50 md:z-0
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    {/* We set activeTab to 'create' so it highlights in the sidebar */}
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        activeTab="create"
                        setActiveTab={() => {}} // No-op since we are on a dedicated page
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 lg:px-12 overflow-y-auto min-h-[calc(100vh-80px)]">

                    {/* Header */}
                    <header className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm active:scale-95 transition"
                        >
                            <FiMenu size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                {isEditing ? "Edit Tour" : "Create New Tour"}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {isEditing ? "Update your tour details below." : "Share your latest adventure with the world."}
                            </p>
                        </div>
                    </header>

                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 max-w-4xl mx-auto"
                    >
                        <PostForm
                            onSubmit={handleSubmit}
                            initialData={initialPost}
                            isEditing={isEditing}
                            onCancel={handleCancel}
                        />
                    </motion.div>
                </main>
            </div>
        </div>
    );
}