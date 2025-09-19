const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes (requires login)
const protect = async (req, res, next) => {
    let token;

    try {
        // Check for Bearer token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];

            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID from token (exclude password)
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({ message: "User not found, token invalid" });
            }

            req.user = user; // Attach user to request
            return next();
        }

        // No token provided
        return res.status(401).json({ message: "Not authorized, no token" });
    } catch (err) {
        console.error("Auth Error:", err.message);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// Middleware for admin-only routes
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    } else {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }
};

module.exports = { protect, admin };
