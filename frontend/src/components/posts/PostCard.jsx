import React from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiHeart, FiMessageSquare, FiEdit2, FiTrash2, FiImage, FiClock } from "react-icons/fi";

export default function PostCard({ post, userId, onLike, onEdit, onDelete, onDetail }) {
    const liked = post.likes?.some((id) => id.toString() === userId?.toString());

    return (
        <motion.div
            layoutId={post._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="h-56 overflow-hidden bg-slate-100 relative">
                {post.image ? (
                    <img
                        src={post.image}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={post.title}
                        onError={(e) => (e.target.src = "https://via.placeholder.com/400x300?text=No+Image")}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <FiImage size={40} />
                    </div>
                )}

                {/* Floating Badge */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-white/50">
                        {post.category}
                    </span>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent transition-opacity duration-300" />
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-500 uppercase tracking-wide">
                    <FiMapPin /> {post.country}
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                    {post.content}
                </p>

                {/* Footer / Actions */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onLike(post._id); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${liked ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"}`}
                        >
                            <FiHeart className={liked ? "fill-current" : ""} />
                            {post.likes?.length || 0}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onDetail(post); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                            <FiMessageSquare /> Details
                        </button>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex gap-2  transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Edit"
                        >
                            <FiEdit2 size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(post._id); }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                            title="Delete"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}