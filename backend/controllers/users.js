const { User, validateUser } = require('../models/user/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CREATE USER
const createUser = async (req, res) => {
    try {
        const { error } = validateUser(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hashed,role:"user" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(201).json({
            message: "User created",
            token,
            user: { id: user._id, name: user.name, email: user.email,role:user.role }
        });

    } catch (err) {
        console.error("Create User Error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET ALL USERS
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET SINGLE USER
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);

    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// UPDATE USER
const updateUser = async (req, res) => {
    try {
        // const { error } = validateUser(req.body);
        // if (error) return res.status(400).json({ message: error.details[0].message });

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select("-password");

        if (!updated) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User updated", user: updated });

    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid password" });

        // Create JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Success response
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role:user.role
            }
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getId=async (req,res)=>{
    const token=req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user._id);
}


// DELETE USER
const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};



module.exports = {
    createUser,
    loginUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,getId
};
