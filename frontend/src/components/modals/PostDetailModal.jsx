import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiX, FiMessageSquare, FiSend, FiMapPin, FiTrash2, FiUser, FiCalendar, FiTag } from "react-icons/fi";
import useComments from "../../hooks/useComments";
import useUser from "../../hooks/userInfo";

export default function PostDetailModal({ post, onClose }) {
    // 1. Get User Data
    const { user } = useUser();
    const currentUserId = user?._id || user?.id; // Safe ID access

    // 2. Init Hook
    const { comments, addComment, deleteComment } = useComments(post._id, currentUserId);
    const [text, setText] = useState("");

    // Lock Body Scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    // Handle Comment Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        // Pass full user object to fix "Name" display issue
        addComment(text, user);
        setText("");
    };

    // Robust Ownership Check for Delete Button
    const isOwner = (commentUser) => {
        if (!currentUserId || !commentUser) return false;
        const myId = String(currentUserId);

        if (typeof commentUser === "string") return String(commentUser) === myId;
        if (commentUser._id) return String(commentUser._id) === myId;
        if (commentUser.id) return String(commentUser.id) === myId;

        return false;
    };

    // Format Date Helper
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all"
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative bg-white w-full max-w-6xl max-h-[90vh] md:max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                >
                    <FiX size={20} />
                </button>

                {/* ================= LEFT SIDE: BLOG CONTENT (RESTORED) ================= */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
                    {/* Hero Image */}
                    <div className="relative h-64 sm:h-80 md:h-96 w-full">
                        {post.image ? (
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                <FiMessageSquare size={48} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
                            <div className="flex items-center gap-3 mb-3 text-sm font-medium opacity-90">
                                {post.category && (
                                    <span className="px-3 py-1 bg-indigo-600 rounded-full shadow-lg uppercase tracking-wider text-xs font-bold">
                                        {post.category}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <FiCalendar size={14} /> {formatDate(post.createdAt)}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight shadow-sm mb-2">
                                {post.title}
                            </h2>

                            {post.location && (
                                <div className="flex items-center gap-2 text-slate-200 font-medium">
                                    <FiMapPin className="text-indigo-400" /> {post.location}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Description */}
                    <div className="p-6 md:p-10">
                        <div className="prose prose-lg prose-indigo max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                            {/* THIS IS THE MISSING PART */}
                            {post.content}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                                {post.tags.map((tag, i) => (
                                    <span key={i} className="flex items-center gap-1 text-sm font-medium bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1 rounded-full">
                                        <FiTag size={12} /> {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= RIGHT SIDE: COMMENTS (FIXED) ================= */}
                <div className="w-full md:w-[400px] lg:w-[450px] bg-slate-50 border-l border-slate-200 flex flex-col h-[50vh] md:h-auto shrink-0">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <FiMessageSquare className="text-indigo-600" />
                            Discussion
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                                {comments.length}
                            </span>
                        </h3>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                        {comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-60">
                                <FiMessageSquare size={32} />
                                <p className="text-sm">No comments yet. Be the first!</p>
                            </div>
                        ) : (
                            comments.map((c) => {
                                const displayName = c.user?.name || "User";
                                const showDelete = isOwner(c.user);

                                return (
                                    <div key={c._id || Math.random()} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm border border-white">
                                            {displayName[0].toUpperCase()}
                                        </div>

                                        {/* Bubble */}
                                        <div className="flex-1">
                                            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200/60 relative group-hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-slate-900">{displayName}</span>

                                                    {showDelete && (
                                                        <button
                                                            onClick={() => deleteComment(c._id)}
                                                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                                            title="Delete comment"
                                                        >
                                                            <FiTrash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed break-words">{c.comment}</p>
                                            </div>
                                            {c.createdAt && (
                                                <div className="text-[10px] text-slate-400 mt-1 ml-1">
                                                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-200">
                        <form onSubmit={handleSubmit} className="relative flex items-center">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="w-full bg-slate-100 hover:bg-slate-50 border border-transparent focus:border-indigo-500/50 focus:bg-white rounded-full pl-5 pr-12 py-3 text-sm outline-none transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={!text.trim()}
                                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-0 disabled:scale-75 transition-all shadow-md active:scale-95"
                            >
                                <FiSend size={16} className="translate-x-[-1px] translate-y-[1px]" />
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}