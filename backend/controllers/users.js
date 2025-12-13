const { User, validateUser } = require('../models/user/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CREATE USER
const createUser = async (req, res) => {
    try {
        const { error } = validateUser(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // 1. Destructure ALL fields you want to save
        const {
            name, email, password, role,
            phoneNumber, address, socialLinks, description
        } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);

        // 2. Pass them to the create function
        const user = await User.create({
            name,
            email,
            password: hashed,
            role: role || 'user',
            // Save the extra fields:
            phoneNumber,
            address,
            socialLinks,
            description,
            verificationData: { status: 'unverified' }
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "User created",
            token,
            user // Send full user back
        });

    } catch (err) {
        console.error("Create User Error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
// GET ALL USERS
const getUsers = async (req, res) => {
    try {
        // Added: Simple filter to get only 'agency' or only 'user' if needed
        // Usage: /users?role=agency
        const filter = req.query.role ? { role: req.query.role } : {};

        const users = await User.find(filter).select("-password");
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
        // SECURITY: Remove sensitive fields from req.body so users can't hack them
        delete req.body.role;           // Prevent self-promotion to admin
        delete req.body.isVerified;     // Prevent fake verification
        delete req.body.verificationData;
        delete req.body.rating;         // Ratings must come from reviews

        // Handle Password Update specifically
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, // Using $set is safer for nested objects like address/socialLinks
            { new: true }
        ).select("-password");

        if (!updated) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User updated", user: updated });

    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// LOGIN USER
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
        // UPDATE: Added 'role' here so frontend knows permissions immediately
        const token = jwt.sign(
            { id: user._id, role: user.role },
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
                role: user.role
            }
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET CURRENT USER (From Token)
const getId = async (req, res) => {
    try {
        if (!req.headers.authorization) return res.status(401).json({message: "No token"});

        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // UPDATE: Return the whole object, not just ID.
        // The Profile Page needs 'name', 'email', 'address' etc to display.
        const user = await User.findById(decoded.id).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user); // Sending the object
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" });
    }
};


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
    deleteUser,
    getId
};