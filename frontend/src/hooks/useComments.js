import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import commentsApi from "../api/commentsApi";

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
        try {
            const res = await commentsApi.create(postId, { comment: text });
            const created = res.data?.comment ?? res.data;
            // Fallback for immediate UI update if populate isn't returned
            const safeComment = { ...created, user: created.user || { _id: userId, name: "Me" } };
            setComments([...comments, safeComment]);
            toast.success("Comment added");
        } catch (err) {
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