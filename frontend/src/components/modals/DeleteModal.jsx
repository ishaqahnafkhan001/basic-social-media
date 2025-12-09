import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteModal({ isOpen, onConfirm, onCancel }) {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-2">Delete this post?</h3>
                    <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium shadow-md">Delete</button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}