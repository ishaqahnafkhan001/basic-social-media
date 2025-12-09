import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiMessageSquare, FiSend } from "react-icons/fi";
import useComments from "../../hooks/useComments";

export default function PostDetailModal({ post, userId, onClose }) {
    const { comments, addComment, deleteComment } = useComments(post._id, userId);
    const [text, setText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        addComment(text);
        setText("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Left: Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white relative">
                    <button onClick={onClose} className="md:hidden absolute top-4 right-4"><FiX size={24} /></button>
                    {post.image && <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-6" />}
                    <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                    <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {post.tags?.map((t, i) => <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">#{t}</span>)}
                    </div>
                </div>

                {/* Right: Comments */}
                <div className="w-full md:w-96 bg-gray-50 border-l flex flex-col h-[50vh] md:h-auto">
                    <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm">
                        <h3 className="font-bold flex items-center gap-2"><FiMessageSquare /> Comments ({comments.length})</h3>
                        <button onClick={onClose} className="hidden md:block p-1 hover:bg-gray-100 rounded"><FiX size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {comments.map((c) => (
                            <div key={c._id} className="flex gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                    {c.user?.name ? c.user.name[0] : "?"}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                                        <div className="flex justify-between"><span className="text-xs font-bold">{c.user?.name}</span></div>
                                        <p className="text-sm mt-1">{c.comment}</p>
                                    </div>
                                    {(c.user?._id === userId || c.user === userId) && (
                                        <button onClick={() => deleteComment(c._id)} className="text-[10px] text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 bg-white border-t relative">
                        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." className="w-full bg-gray-100 rounded-full px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="submit" disabled={!text.trim()} className="absolute right-6 top-5 text-blue-600 hover:text-blue-800 disabled:opacity-50"><FiSend size={18} /></button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}