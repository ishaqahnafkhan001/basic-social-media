import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import commentsApi from "../api/commentsApi.js";

export default function useComments(postId, userId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!postId) return;
        const fetchComments = async () => {
            setLoading(true);
            try {
                const res = await commentsApi.getByPostId(postId);
                setComments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [postId]);


    const addComment = async (text) => {
        // optimistically update UI could go here, but let's wait for success
        try {
            const res = await commentsApi.create(postId, { comment: text });

            console.log("Create Comment Response:", res.data);

            const serverData = res.data.comment || res.data || {};

            // 🛡️ HYBRID FIX: Force the text content
            const safeComment = {
                _id: serverData._id || Math.random().toString(),
                createdAt: new Date().toISOString(),
                ...serverData,
                // FORCE these two fields to ensure it's never blank:
                comment: text, // <--- Use the text argument directly!
                user: serverData.user || { _id: userId, name: "Me" }
            };

            setComments((prev) => [...prev, safeComment]);
            toast.success("Comment added");
        } catch (err) {
            console.error(err);
            toast.error("Failed to add comment");
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await commentsApi.remove(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            toast.success("Comment deleted");
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    return { comments, loading, addComment, deleteComment };
}