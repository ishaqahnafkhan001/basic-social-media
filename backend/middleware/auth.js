const jwt = require("jsonwebtoken");
const {User} = require("../models/user/user");

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Load user
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (err) {
        console.error("AuthMiddleware Error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const isAgency = (req, res, next) => {
    // Safety check: Ensure authMiddleware ran first
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    // Check the role (Make sure your User model has a 'role' field)
    if (req.user.role !== 'agency') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Restricted to Agencies only."
        });
    }

    next();
};

module.exports = { authMiddleware, isAgency };