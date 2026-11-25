
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Check whether the user is logged in
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Please log in first.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid or inactive account.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed. Please log in again.",
    });
  }
};

// Check whether the logged-in user is an admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only.",
    });
  }

  next();
};

module.exports = { authenticate, requireAdmin };
