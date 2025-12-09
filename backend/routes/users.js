const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");

const {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,loginUser,getId
} = require("../controllers/users");

// CREATE
router.post("/", createUser);

// READ
router.post("/login", loginUser);

router.get("/id", authMiddleware, getId);
router.get("/", authMiddleware, getUsers);
router.get("/:id",authMiddleware, getUser);

// UPDATE
router.put("/:id", authMiddleware, updateUser);

// DELETE
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
