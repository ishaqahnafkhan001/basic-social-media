const Comment = require('../models/Comment'); // Adjust path to your model

// @desc    Create a new comment
// @route   POST /api/comments/:postId
// @access  Private (User must be logged in)
const createComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const { postId } = req.params; // Assuming postId is passed in URL

        // Ensure userId is available (usually set by auth middleware)
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!comment) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const newComment = new Comment({
            post: postId,
            user: req.user._id, // Taken from the logged-in user
            comment: comment
        });

        const savedComment = await newComment.save();

        // Populate user details immediately so the frontend can display the name/avatar right away
        const populatedComment = await savedComment.populate('user', 'name email profilePic');

        res.status(201).json(populatedComment);

    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Server error while adding comment" });
    }
};

// @desc    Get all comments for a specific post
// @route   GET /api/comments/:postId
// @access  Public
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
            .populate('user', 'name email profilePic') // Get user details
            .sort({ createdAt: -1 }); // Newest comments first

        res.status(200).json(comments);

    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Server error while fetching comments" });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private (Owner only)
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the logged-in user is the owner of the comment
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Server error while deleting comment" });
    }
};

module.exports = {
    createComment,
    getPostComments,
    deleteComment
};