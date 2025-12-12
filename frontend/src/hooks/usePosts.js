import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import postApi from "../api/postApi";

export default function usePosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // 1. Initialize User
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    // 2. Fetch Posts
    const fetchPosts = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            let res;

            if (currentUser.role === 'admin') {
                // Admin gets everything
                res = await postApi.getAll();
            } else {
                // Regular user gets THEIR posts
                const id = currentUser.id || currentUser._id;

                // 👇 FIX IS HERE: Use getPostsByUser, not getById
                res = await postApi.getPostsByUser(id);
            }

            // Ensure we are setting an array (handle API variations)
            const data = res.data?.posts || res.data || [];
            setPosts(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Trigger fetch
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // 3. CRUD Actions
    const createPost = async (data) => {
        setLoading(true);
        try {
            const res = await postApi.create(data);

            // 🔍 DEBUGGING: Check what the server actually sends back
            // console.log("Server Response:", res.data);

            // 🛠️ FIX: Extract the actual post object
            // If your backend sends { message: "Created", post: { ... } }, use res.data.post
            // If your backend sends just the post object, use res.data
            const newPost = res.data.post || res;

            // Update state with the CLEAN post object
            setPosts((prevPosts) => [newPost, ...prevPosts]);

            return true;
        } catch (error) {
            console.error("Failed to create post", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updatePost = useCallback(async (id, data) => {
        const toastId = toast.loading("Updating...");
        try {
            const res = await postApi.update(id, data);
            const updated = res.data?.post ?? res.data;
            setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
            toast.success("Post updated!", { id: toastId });
            return updated;
        } catch (err) {
            toast.error("Update failed", { id: toastId });
            return null;
        }
    }, []);

    const deletePost = useCallback(async (id) => {
        const previousPosts = [...posts];
        setPosts((prev) => prev.filter((p) => p._id !== id));

        try {
            await postApi.remove(id);
            toast.success("Post deleted");
            return true;
        } catch (err) {
            setPosts(previousPosts);
            toast.error("Delete failed");
            return false;
        }
    }, [posts]);

    const toggleLike = useCallback(async (id) => {
        try {
            const res = await postApi.toggleLike(id);
            const updatedLikes = res.data?.likes ?? res.data;
            setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, likes: updatedLikes } : p)));
            return updatedLikes;
        } catch (err) {
            console.error("Like failed", err);
        }
    }, []);

    return {
        posts,
        loading,
        userId: currentUser?._id || currentUser?.id,
        currentUser,
        createPost,
        updatePost,
        deletePost,
        toggleLike,
        refreshPosts: fetchPosts
    };
}