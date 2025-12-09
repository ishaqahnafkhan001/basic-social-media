import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FiMenu, FiUser } from "react-icons/fi";

// Hooks
import usePosts from "../hooks/usePosts";

// Components
import Sidebar from "../components/layout/Sidebar";
import PostCard from "../components/posts/PostCard";
import PostForm from "../components/posts/PostForm";
import PostDetailModal from "../components/modals/PostDetailModal";
import DeleteModal from "../components/modals/DeleteModal";

export default function Dashboard() {
    const { posts, loading, userId, createPost, updatePost, deletePost, toggleLike } = usePosts();

    // Local UI State
    const [activeTab, setActiveTab] = useState("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [detailPost, setDetailPost] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // Handlers
    const handleCreate = async (data) => {
        const success = await createPost(data);
        if (success) setActiveTab("all");
    };

    const handleUpdate = async (data) => {
        const updated = await updatePost(editingPost._id, data);
        if (updated) {
            setEditingPost(null);
            setActiveTab("all");
            // Update detail modal if open
            if (detailPost && detailPost._id === updated._id) setDetailPost(updated);
        }
    };

    const handleEditClick = (post) => {
        setEditingPost(post);
        setActiveTab("create");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteConfirm = async () => {
        await deletePost(deleteId);
        setDeleteId(null);
        if (detailPost?._id === deleteId) setDetailPost(null);
    };

    const handleLikeClick = async (id) => {
        const updatedLikes = await toggleLike(id);
        if (detailPost && detailPost._id === id) {
            setDetailPost((prev) => ({ ...prev, likes: updatedLikes }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex relative">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 border rounded-lg bg-white"><FiMenu /></button>
                        <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-gray-500 text-sm hidden md:block">Manage your travels</p></div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><FiUser /></div>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === "create" || editingPost ? (
                        <PostForm
                            key="form"
                            onSubmit={editingPost ? handleUpdate : handleCreate}
                            initialData={editingPost}
                            isEditing={!!editingPost}
                            onCancel={() => { setEditingPost(null); setActiveTab("all"); }}
                        />
                    ) : (
                        <div key="grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                            {loading && <div className="col-span-full text-center py-20">Loading...</div>}
                            {!loading && posts.length === 0 && <div className="col-span-full text-center py-20 text-gray-500">No posts yet.</div>}
                            {posts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    userId={userId}
                                    onLike={handleLikeClick}
                                    onEdit={handleEditClick}
                                    onDelete={setDeleteId}
                                    onDetail={setDetailPost}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals */}
            <DeleteModal isOpen={!!deleteId} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
            {detailPost && <PostDetailModal post={detailPost} userId={userId} onClose={() => setDetailPost(null)} />}
        </div>
    );
}