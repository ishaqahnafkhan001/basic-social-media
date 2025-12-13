import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Hooks & Components
import usePosts from "../hooks/usePosts";
import useUser from "../hooks/userInfo";
import Sidebar from "../components/layout/Sidebar.jsx";
import PostCard from "../components/posts/PostCard";
import PostDetailModal from "../components/modals/PostDetailModal";
import DeleteModal from "../components/modals/DeleteModal";
import Nav from "../components/nav/Nav.jsx";

// --- Sub-components for cleaner Main JSX ---
const LoadingState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading adventures...</p>
    </div>
);

const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="bg-slate-50 p-4 rounded-full mb-3">
            <FiMenu className="text-slate-300" size={24} />
        </div>
        <h3 className="text-slate-900 font-medium">No tours yet</h3>
        <p className="text-slate-500 text-sm mt-1">Create your first tour to get started.</p>
    </div>
);

const NoResultsState = ({ query, onClear }) => (
    <div className="col-span-full text-center py-20">
        <p className="text-slate-500">
            No tours found matching "<span className="font-medium text-slate-700">{query}</span>"
        </p>
        <button
            onClick={onClear}
            className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
        >
            Clear search
        </button>
    </div>
);

export default function BlogDashboard() {
    const navigate = useNavigate();

    // Hooks
    const { posts, loading, userId, deletePost, toggleLike } = usePosts();
    const userInfo = useUser();
    const role = userInfo?.role || "user";

    // State
    const [activeTab, setActiveTab] = useState("myBlog");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [detailPost, setDetailPost] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // Search State
    const [searchTerm, setSearchTerm] = useState(""); // Immediate input value
    const [debouncedQuery, setDebouncedQuery] = useState(""); // Delayed value for filtering

    // --- Effects ---

    // Debounce Search: Update query only after user stops typing for 300ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- Computed ---

    const filteredPosts = useMemo(() => {
        if (!debouncedQuery) return posts;
        const lowerQuery = debouncedQuery.toLowerCase();
        return posts.filter(post =>
            post.title?.toLowerCase().includes(lowerQuery) ||
            post.category?.toLowerCase().includes(lowerQuery) ||
            post.location?.toLowerCase().includes(lowerQuery)
        );
    }, [posts, debouncedQuery]);

    // --- Handlers (Memoized) ---

    const handleEditClick = useCallback((post) => {
        navigate("/create-blog", { state: { post } });
    }, [navigate]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteId) return;
        await deletePost(deleteId);
        setDeleteId(null);
        // If the deleted post is currently open in modal, close it
        setDetailPost((prev) => (prev?._id === deleteId ? null : prev));
    }, [deletePost, deleteId]);

    const handleLikeClick = useCallback(async (id) => {
        const updatedLikes = await toggleLike(id);
        setDetailPost((prev) => {
            if (prev && prev._id === id) {
                return { ...prev, likes: updatedLikes };
            }
            return prev;
        });
    }, [toggleLike]);

    const clearSearch = () => setSearchTerm("");

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
                <aside className={`
                    fixed md:sticky top-0 h-screen md:h-[calc(100vh-80px)] z-50 md:z-0
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </aside>

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
                                    Blog Dashboard
                                </h1>
                                <p className="text-sm text-slate-500 mt-1 hidden sm:block">
                                    Overview of your tour content.
                                </p>
                            </div>
                        </div>

                        {/* Search & Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative group w-full sm:w-64">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search tours..."
                                    className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <FiX size={14} />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => navigate("/create-blog")}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <span>+ New Blog</span>
                            </button>
                        </div>
                    </header>

                    {/* Content Grid */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20"
                    >
                        {loading ? (
                            <LoadingState />
                        ) : posts.length === 0 ? (
                            <EmptyState />
                        ) : filteredPosts.length === 0 ? (
                            <NoResultsState query={searchTerm} onClear={clearSearch} />
                        ) : (
                            filteredPosts.map((post) => (
                                <motion.div
                                    key={post._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
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
                            ))
                        )}
                    </motion.div>
                </main>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {!!deleteId && (
                    <DeleteModal
                        isOpen={!!deleteId}
                        onConfirm={handleDeleteConfirm}
                        onCancel={() => setDeleteId(null)}
                    />
                )}
                {detailPost && (
                    <PostDetailModal
                        post={detailPost}
                        userId={userId}
                        onClose={() => setDetailPost(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}