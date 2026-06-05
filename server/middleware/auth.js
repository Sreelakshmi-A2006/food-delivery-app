const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header("Authorization") || req.header("authorization");
    
    if (!authHeader) {
        return res.status(401).json({ message: "No authorization token, access denied" });
    }

    // Check if Bearer prefix is present
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).json({ message: "Token format is invalid, must be Bearer <token>" });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user payload to request (contains id, email, role)
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);
        return res.status(401).json({ message: "Token is not valid or has expired" });
    }
};

module.exports = authMiddleware;
