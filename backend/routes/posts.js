const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost
} = require("../controllers/post");

// PUBLIC ROUTES
router.get("/", getPosts);
router.get("/:id", getPost);

// PROTECTED ROUTES
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;


// {
//     "name": "Alex",
//     "email": "alex_test@example.com",
//     "password": "test1234"
// }
//