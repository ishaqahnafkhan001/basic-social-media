const { Post, validatePost } = require("../models/blog/post");

// CREATE POST
const createPost = async (req, res) => {
    try {
        const { error } = validatePost(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const newPost = await Post.create({
            ...req.body,
            user: req.user.id    // always take from token
        });

        return res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });
    } catch (err) {
        console.error("Create Post Error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// GET ALL POSTS
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return res.json(posts);
    } catch (err) {
        console.error("Get Posts Error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// GET SINGLE POST
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "name email");

        if (!post) return res.status(404).json({ message: "Post not found" });

        return res.json(post);
    } catch (err) {
        console.error("Get Post Error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getPostsByUser = async (req, res) => {
    try {
        const { id } = req.params;

        const posts = await Post.find({ user: id })
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        return res.json(posts);

    } catch (err) {
        console.error("Get Posts by User Error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// UPDATE POST
const updatePost = async (req, res) => {
    try {
        const { error } = validatePost(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed to update this post" });
        }

        Object.assign(post, req.body);

        if (req.body.title) {
            post.slug = req.body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
        }

        await post.save();

        return res.json({
            message: "Post updated successfully",
            post
        });
    } catch (err) {
        console.error("Update Post Error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// DELETE POST
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed to delete this post" });
        }

        await post.deleteOne();
        return res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error("Delete Post Error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// @desc    Like or Unlike a post
// @route   PUT /api/posts/like/:id
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the post has already been liked by this user
        // We compare ObjectIds by converting to string
        const isLiked = post.likes.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (isLiked) {
            // IF ALREADY LIKED: Remove user from likes array (Unlike)
            post.likes = post.likes.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
            await post.save();
            return res.status(200).json({ message: "Post unliked", likes: post.likes });
        } else {
            // IF NOT LIKED: Add user to likes array (Like)
            post.likes.unshift(req.user._id); // Add to beginning of array
            await post.save();
            return res.status(200).json({ message: "Post liked", likes: post.likes });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,getPostsByUser,toggleLike
};
