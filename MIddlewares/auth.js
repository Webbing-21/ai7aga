const jwt = require('jsonwebtoken');
require('dotenv').config()

const tokenBlacklist = new Set();

 module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        if (tokenBlacklist.has(token)) {
            return res.status(403).json({ message: "Session expired. Please login again" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Authentication failed" });
    }
};
module.exports.tokenBlacklist = tokenBlacklist;