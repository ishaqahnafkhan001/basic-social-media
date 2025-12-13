import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import commentsApi from "../api/commentsApi.js";

export default function useComments(postId, userId) {
    const [comments, setComments] = useState([]);

    // 1. Fetch Comments
    useEffect(() => {
        if (!postId) return;
        const fetchComments = async () => {
            try {
                const res = await commentsApi.getByPostId(postId);
                setComments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchComments();
    }, [postId]);

    // 2. Add Comment (FIXED)
    const addComment = async (text, userInfo) => {
        try {
            const res = await commentsApi.create(postId, { comment: text });

            // DEBUG: Log this to see exactly where the _id is
            console.log("Server Response:", res.data);

            // Handle different API response structures:
            // Case A: res.data IS the comment object
            // Case B: res.data.comment IS the comment object
            // Case C: res.data.data IS the comment object
            const serverComment = res.data.comment || res.data.data || res.data;

            if (!serverComment || !serverComment._id) {
                console.error("Critical Error: No ID returned from server", res.data);
                toast.error("Comment saved but needs reload to delete");
                return;
            }

            const newComment = {
                _id: serverComment._id, // <--- MUST HAVE THIS FOR DELETE TO WORK
                comment: text,
                createdAt: new Date().toISOString(),
                // Manually build user object for the UI
                user: {
                    _id: userInfo._id, // Ensure this matches exactly what's in useUser
                    name: userInfo.name,
                    ...userInfo
                }
            };

            setComments((prev) => [...prev, newComment]);
            toast.success("Comment added");
        } catch (err) {
            console.error(err);
            toast.error("Failed to add comment");
        }
    };

    // 3. Delete Comment
    const deleteComment = async (commentId) => {
        if (!commentId) {
            console.error("Cannot delete: ID is missing");
            return;
        }
        try {
            await commentsApi.remove(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            toast.success("Comment deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete");
        }
    };

    return { comments, addComment, deleteComment };
}