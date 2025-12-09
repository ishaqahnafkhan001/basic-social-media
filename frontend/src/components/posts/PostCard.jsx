import React from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiHeart, FiMessageSquare, FiEdit2, FiTrash2, FiImage } from "react-icons/fi";

export default function PostCard({ post, userId, onLike, onEdit, onDelete, onDetail }) {
    const liked = post.likes?.some((id) => id.toString() === userId?.toString());

    return (
        <motion.div layoutId={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            <div className="h-48 overflow-hidden bg-gray-100 relative group">
                {post.image ? (
                    <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={post.title} onError={(e) => (e.target.src = "https://via.placeholder.com/400x300?text=No+Image")} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><FiImage size={32} /></div>
                )}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
          {post.category}
        </span>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase">
                    <FiMapPin className="text-blue-500" /> {post.country}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{post.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{post.content}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex gap-2">
                        <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${liked ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                            <FiHeart className={liked ? "fill-current" : ""} /> {post.likes?.length || 0}
                        </button>
                        <button onClick={() => onDetail(post)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-gray-200">
                            <FiMessageSquare /> Info
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onEdit(post)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"><FiEdit2 size={16} /></button>
                        <button onClick={() => onDelete(post._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"><FiTrash2 size={16} /></button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}