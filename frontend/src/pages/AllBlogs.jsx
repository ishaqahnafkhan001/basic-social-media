import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiSearch, FiMessageSquare, FiHeart } from "react-icons/fi";
import toast from "react-hot-toast";

// Components
import Sidebar from "../components/layout/Sidebar";
import Nav from "../components/nav/Nav";
import PostCard from "../components/posts/PostCard";
import PostDetailModal from "../components/modals/PostDetailModal";

// API & Hooks
import postApi from "../api/postApi";
import useUser from "../hooks/userInfo"; // Assuming you have this based on Sidebar

export default function AllBlogs() {
    // State
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // For the modal

    // User Info (needed to check if current user liked a post)
    const { userId } = useUser() || { userId: null };

    // 1. Fetch All Posts on Mount
    useEffect(() => {
        fetchPosts();
    }, []);

    // 2. Search Filtering Effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredPosts(posts);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = posts.filter(post =>
                post.title?.toLowerCase().includes(lowerQuery) ||
                post.content?.toLowerCase().includes(lowerQuery) ||
                post.location?.toLowerCase().includes(lowerQuery)
            );
            setFilteredPosts(filtered);
        }
    }, [searchQuery, posts]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await postApi.getAll();
            // Sort by newest first
            const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPosts(sorted);
            setFilteredPosts(sorted);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
            toast.error("Could not load blogs");
        } finally {
            setLoading(false);
        }
    };

    // 3. Handle Like
    const handleLike = async (postId) => {
        try {
            const res = await postApi.toggleLike(postId);
            const updatedLikes = res.data.likes || res.data; // Adjust based on your API response structure

            // Update local state to reflect like immediately without reload
            setPosts(prevPosts =>
                prevPosts.map(p => p._id === postId ? { ...p, likes: updatedLikes } : p)
            );

            // If modal is open, update that too
            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost(prev => ({ ...prev, likes: updatedLikes }));
            }
        } catch (error) {
            console.error("Like failed", error);
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Top Navigation */}
            <Nav cartCount={0} userRole="user" />

            <div className="flex max-w-[1600px] mx-auto">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    activeTab="all-blog"
                    setActiveTab={() => {}} // No-op since we are routing via Links in Sidebar
                />

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto h-[calc(100vh-80px)]">

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
                        <div className="relative w-full md:w-96">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search destinations, titles..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </header>

                    {/* Content Grid */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <p>Loading stories...</p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
                                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <FiSearch size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No stories found</h3>
                                <p className="text-slate-500">Try searching for something else.</p>
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20"
                            >
                                <AnimatePresence>
                                    {filteredPosts.map((post) => (
                                        <motion.div
                                            key={post._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {/* Reusing PostCard.
                                                Note: In AllBlogs, we usually don't allow Edit/Delete unless Admin.
                                                We pass undefined or null for onEdit/onDelete to hide those buttons
                                                (assuming PostCard handles conditional rendering).
                                            */}
                                            <PostCard
                                                post={post}
                                                userId={userId}
                                                onLike={handleLike}
                                                onDetail={setSelectedPost} // Opens the modal
                                                // onEdit={null} -> Intentionally hidden
                                                // onDelete={null} -> Intentionally hidden
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>

            {/* Post Detail Modal (For Reading & Comments) */}
            <AnimatePresence>
                {selectedPost && (
                    <PostDetailModal
                        post={selectedPost}
                        userId={userId}
                        onClose={() => setSelectedPost(null)}
                        // Pass handleLike here if the modal has a like button inside it
                        onLike={handleLike}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}