const express = require("express");
const router = express.Router();
const {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
} = require("../controllers/users");

// CREATE
router.post("/", createUser);

// READ
router.get("/", getUsers);
router.get("/:id", getUser);

// UPDATE
router.put("/:id", updateUser);

// DELETE
router.delete("/:id", deleteUser);

module.exports = router;
