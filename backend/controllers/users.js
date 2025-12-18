const { User, validateUser } = require('../models/user/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require("../config/cloudinary");

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
        // 1. Fetch the user
        let user = await User.findById(req.params.id).select("-password").lean(); // .lean() converts Mongoose obj to plain JS object so we can edit it

        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. CHECK PERMISSIONS
        // Who is asking? (req.user might be undefined if guest)
        const viewerId = req.user ? req.user.id : null;
        const viewerRole = req.user ? req.user.role : 'guest';
        const isOwner = viewerId === user._id.toString();
        const isAdmin = viewerRole === 'admin';

        // 3. PRIVACY LOGIC
        // If the profile belongs to a normal 'user' (not agency),
        // AND the viewer is NOT the owner OR admin...
        // HIDE sensitive details.
        if (user.role === 'user' && !isOwner && !isAdmin) {
            delete user.email;
            delete user.phoneNumber;
            delete user.address;
            // Keep name, bio, image, and social links public
        }

        // (Agencies usually WANT their phone number public, so we don't delete it for them)

        res.json(user);

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
// UPDATE USER
const updateUser = async (req, res) => {
    try {
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied." });
        }

        const safeUpdates = { ...req.body };
        delete safeUpdates.role;
        delete safeUpdates.isVerified;
        delete safeUpdates.verificationData;
        delete safeUpdates.rating;
        delete safeUpdates.password;

        // ✅ Image Upload Logic (Only here now)
        if (req.file && req.file.path) {
            safeUpdates.profilePictureUrl = req.file.path;
        }

        // Parse nested JSON if sent via FormData
        if (typeof safeUpdates.address === 'string') {
            try { safeUpdates.address = JSON.parse(safeUpdates.address); } catch(e) {}
        }
        if (typeof safeUpdates.socialLinks === 'string') {
            try { safeUpdates.socialLinks = JSON.parse(safeUpdates.socialLinks); } catch(e) {}
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: safeUpdates },
            { new: true, runValidators: true }
        ).select("-password");

        res.json({ message: "Profile updated", user: updatedUser });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Server error" });
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