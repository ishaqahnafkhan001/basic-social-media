import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMessageSquare, FiSend, FiMapPin, FiTrash2, FiUser } from "react-icons/fi";
import useComments from "../../hooks/useComments";

export default function PostDetailModal({ post, userId, onClose }) {
    const { comments, addComment, deleteComment } = useComments(post._id, userId);
    const [text, setText] = useState("");

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        addComment(text);
        setText("");
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all"
            />

            {/* Modal Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative bg-white w-full max-w-6xl max-h-[90vh] md:max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
                {/* Close Button (Mobile Absolute / Desktop Absolute) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                >
                    <FiX size={20} />
                </button>

                {/* LEFT SIDE: Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {/* Hero Image */}
                    <div className="relative h-64 sm:h-80 md:h-96 w-full">
                        {post.image ? (
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                <FiMessageSquare size={48} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                            {post.category && (
                                <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 rounded-full shadow-lg">
                                    {post.category}
                                </span>
                            )}
                            <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight shadow-sm">
                                {post.title}
                            </h2>
                            {post.country && (
                                <div className="flex items-center gap-2 mt-2 text-slate-200 font-medium">
                                    <FiMapPin className="text-indigo-400" /> {post.country}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="p-6 md:p-8">
                        <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line mb-8">
                            {post.content}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-6">
                                {post.tags.map((t, i) => (
                                    <span key={i} className="text-sm font-medium bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1 rounded-full">
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Comments (Fixed width on desktop) */}
                <div className="w-full md:w-[400px] lg:w-[450px] bg-slate-50 border-l border-slate-200 flex flex-col h-[50vh] md:h-auto">

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
                            comments.map((c) => (
                                <div key={c._id} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm border border-white">
                                        {c.user?.name ? c.user.name[0].toUpperCase() : <FiUser />}
                                    </div>

                                    {/* Bubble */}
                                    <div className="flex-1">
                                        <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200/60 relative group-hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-slate-900">{c.user?.name || "Anonymous"}</span>
                                                {/* Delete Action */}
                                                {(c.user?._id === userId || c.user === userId) && (
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
                                    </div>
                                </div>
                            ))
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