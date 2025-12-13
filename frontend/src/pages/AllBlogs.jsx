import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiSearch, FiX } from "react-icons/fi"; // Added FiX for clearing search
import toast from "react-hot-toast";

// Components
import Sidebar from "../components/layout/Sidebar.jsx";
import Nav from "../components/nav/Nav";
import PostCard from "../components/posts/PostCard";
import PostDetailModal from "../components/modals/PostDetailModal";

// API & Hooks
import postApi from "../api/postApi";
import useUser from "../hooks/userInfo";

// --- Helper Components ---
const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p>Loading stories...</p>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FiSearch size={24} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No stories found</h3>
        <p className="text-slate-500">There are no blogs available right now.</p>
    </div>
);

export default function AllBlogs() {
    // --- State ---
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    // Hooks
    const { userId } = useUser() || {}; // Null safety

    // --- Effects ---

    // 1. Fetch Posts
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await postApi.getAll();
                // Sort by newest first
                const sorted = Array.isArray(res.data)
                    ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    : [];
                setPosts(sorted);
            } catch (error) {
                console.error("Failed to fetch blogs", error);
                toast.error("Could not load blogs");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // 2. Debounce Search Input (Waits 300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- Computed Data ---

    const filteredPosts = useMemo(() => {
        if (!debouncedQuery.trim()) return posts;

        const lowerQuery = debouncedQuery.toLowerCase();
        return posts.filter(post =>
            post.title?.toLowerCase().includes(lowerQuery) ||
            post.content?.toLowerCase().includes(lowerQuery) ||
            post.location?.toLowerCase().includes(lowerQuery)
        );
    }, [posts, debouncedQuery]);

    // --- Handlers ---

    const handleLike = useCallback(async (postId) => {
        try {
            const res = await postApi.toggleLike(postId);
            const updatedLikes = res.data.likes || res.data;

            // Update local list state
            setPosts(prevPosts =>
                prevPosts.map(p => p._id === postId ? { ...p, likes: updatedLikes } : p)
            );

            // Update modal state if open
            setSelectedPost(prev => (prev && prev._id === postId ? { ...prev, likes: updatedLikes } : prev));
        } catch (error) {
            console.error("Like failed", error);
            toast.error("Something went wrong");
        }
    }, []);

    const clearSearch = () => setSearchTerm("");

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            {/* Top Navigation */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <Nav cartCount={0} userRole="user" />
            </div>

            <div className="flex flex-1 max-w-[1920px] mx-auto w-full relative">

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed md:sticky top-0 h-screen md:h-[calc(100vh-80px)] z-50 md:z-0
                    transition-transform duration-300 ease-in-out bg-white md:bg-transparent
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        activeTab="all-blog"
                        setActiveTab={() => {}}
                    />
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto min-h-[calc(100vh-80px)]">

                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition"
                            >
                                <FiMenu size={20} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Explore Tours
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    Read travel stories from the community.
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-96 group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search destinations, titles..."
                                className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Content Grid */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <LoadingState />
                        ) : posts.length === 0 ? (
                            <EmptyState />
                        ) : filteredPosts.length === 0 ? (
                            // State for when search returns no results
                            <div className="text-center py-20">
                                <p className="text-slate-500">No stories match "<span className="font-semibold">{searchTerm}</span>"</p>
                                <button onClick={clearSearch} className="text-indigo-600 font-medium text-sm mt-2 hover:underline">Clear search</button>
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20"
                            >
                                {filteredPosts.map((post) => (
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
                                            onLike={handleLike}
                                            onDetail={setSelectedPost}
                                            // Explicitly passing undefined for actions user shouldn't see here
                                            onEdit={undefined}
                                            onDelete={undefined}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>

            {/* Post Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <PostDetailModal
                        post={selectedPost}
                        userId={userId}
                        onClose={() => setSelectedPost(null)}
                        onLike={handleLike}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}