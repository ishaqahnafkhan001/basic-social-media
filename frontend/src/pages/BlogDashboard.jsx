import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";

// Hooks & Components
import usePosts from "../hooks/usePosts";
import Sidebar from "../components/profile/Sidebar.jsx";
import PostCard from "../components/posts/PostCard";
import PostForm from "../components/posts/PostForm";
import PostDetailModal from "../components/modals/PostDetailModal";
import DeleteModal from "../components/modals/DeleteModal";
import Nav from "../components/nav/Nav.jsx";

export default function BlogDashboard() {
    const { posts, loading, userId, createPost, updatePost, deletePost, toggleLike } = usePosts();

    // Local UI State
    const [activeTab, setActiveTab] = useState("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [detailPost, setDetailPost] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // --- Search Logic ---
    const filteredPosts = useMemo(() => {
        if (!searchQuery) return posts;
        const lowerQuery = searchQuery.toLowerCase();
        return posts.filter(post =>
            post.title?.toLowerCase().includes(lowerQuery) ||
            post.category?.toLowerCase().includes(lowerQuery) ||
            post.location?.toLowerCase().includes(lowerQuery)
        );
    }, [posts, searchQuery]);

    // --- Handlers ---
    const handleCreate = async (data) => {
        const success = await createPost(data);
        if (success) setActiveTab("all");
    };

    const handleUpdate = async (data) => {
        const updated = await updatePost(editingPost._id, data);
        if (updated) {
            setEditingPost(null);
            setActiveTab("all");
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            {/* Top Navigation */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <Nav cartCount={0} userRole="admin" />
            </div>

            <div className="flex flex-1 max-w-[1920px] mx-auto w-full relative">

                {/* Mobile Sidebar Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar - Responsive Wrapper */}
                <div className={`
                    fixed md:sticky top-0 h-screen md:h-[calc(100vh-80px)] z-50 md:z-0
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <Sidebar
                        isOpen={true} // Always true internally, visibility handled by parent CSS
                        onClose={() => setSidebarOpen(false)}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 lg:px-12 overflow-y-auto min-h-[calc(100vh-80px)]">

                    {/* Page Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm active:scale-95 transition"
                            >
                                <FiMenu size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                    {activeTab === 'create' ? 'Create New Tour' : 'Blog Dashboard'}
                                </h1>
                                <p className="text-sm text-slate-500 mt-1 hidden sm:block">
                                    {activeTab === 'create' ? 'Share your latest adventure.' : 'Overview of your tour content.'}
                                </p>
                            </div>
                        </div>

                        {/* Search / Action Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {activeTab !== 'create' && (
                                <div className="relative group w-full sm:w-64">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search tours..."
                                        className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => { setActiveTab('create'); setEditingPost(null); }}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <span>+ New Tour</span>
                            </button>
                        </div>
                    </header>

                    {/* Content Body */}
                    <AnimatePresence mode="wait">
                        {activeTab === "create" || editingPost ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 max-w-4xl mx-auto"
                            >
                                <PostForm
                                    onSubmit={editingPost ? handleUpdate : handleCreate}
                                    initialData={editingPost}
                                    isEditing={!!editingPost}
                                    onCancel={() => { setEditingPost(null); setActiveTab("all"); }}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20"
                            >
                                {/* Loading State */}
                                {loading && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400">
                                        <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                                        <p className="text-sm">Loading adventures...</p>
                                    </div>
                                )}

                                {/* Empty State (Total) */}
                                {!loading && posts.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <FiMenu className="text-slate-300" size={24} />
                                        </div>
                                        <h3 className="text-slate-900 font-medium">No tours yet</h3>
                                        <p className="text-slate-500 text-sm mt-1">Create your first tour to get started.</p>
                                    </div>
                                )}

                                {/* Empty State (Search Results) */}
                                {!loading && posts.length > 0 && filteredPosts.length === 0 && (
                                    <div className="col-span-full text-center py-20">
                                        <p className="text-slate-500">No tours found matching "<span className="font-medium text-slate-700">{searchQuery}</span>"</p>
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                )}

                                {/* Post Grid */}
                                {filteredPosts.map((post, index) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <PostCard
                                            post={post}
                                            userId={userId}
                                            onLike={handleLikeClick}
                                            onEdit={handleEditClick}
                                            onDelete={setDeleteId}
                                            onDetail={setDetailPost}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {!!deleteId && <DeleteModal isOpen={!!deleteId} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />}
                {detailPost && <PostDetailModal post={detailPost} userId={userId} onClose={() => setDetailPost(null)} />}
            </AnimatePresence>
        </div>
    );
}