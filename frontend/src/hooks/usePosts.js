import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import postApi from "../api/postApi";
import authApi from "../api/authApi";

export default function usePosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    // Initialize
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) return;
                const userRes = await authApi.id(token);
                setUserId(userRes.data);
                const postRes = await postApi.getPostsByUser(userRes.data);
                setPosts(Array.isArray(postRes.data) ? postRes.data : []);
            } catch (err) {
                toast.error("Failed to load posts");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // CRUD Actions
    const createPost = async (data) => {
        try {
            const res = await postApi.create(data);
            const newPost = res.data?.post ?? res.data;
            setPosts([newPost, ...posts]);
            toast.success("Post created!");
            return true; // success signal
        } catch (err) {
            toast.error(err.response?.data?.message || "Creation failed");
            return false;
        }
    };

    const updatePost = async (id, data) => {
        try {
            const res = await postApi.update(id, data);
            const updated = res.data?.post ?? res.data;
            setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
            toast.success("Post updated!");
            return updated;
        } catch (err) {
            toast.error("Update failed");
            return null;
        }
    };

    const deletePost = async (id) => {
        try {
            await postApi.remove(id);
            setPosts((prev) => prev.filter((p) => p._id !== id));
            toast.success("Post deleted");
            return true;
        } catch (err) {
            toast.error("Delete failed");
            return false;
        }
    };

    const toggleLike = async (id) => {
        try {
            const res = await postApi.toggleLike(id);
            const updatedLikes = res.data?.likes ?? res.data;
            setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, likes: updatedLikes } : p)));
            return updatedLikes;
        } catch (err) {
            console.error(err);
        }
    };

    return { posts, loading, userId, createPost, updatePost, deletePost, toggleLike };
}