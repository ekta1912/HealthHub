const userModel = require("../models/userModel");

/**
 * Middleware to enforce Admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user identified" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isAdmin && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Administrator privileges required",
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error("Require Admin Error:", error);
    res.status(500).json({ success: false, message: "Internal role verification error", error: error.message });
  }
};

/**
 * Middleware to enforce Doctor or Admin role
 */
const requireDoctorOrAdmin = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user identified" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPrivileged = user.isAdmin || user.isDoctor || user.role === "admin" || user.role === "doctor";
    if (!isPrivileged) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Doctor or Administrator privileges required",
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error("Require Doctor Error:", error);
    res.status(500).json({ success: false, message: "Internal role verification error", error: error.message });
  }
};

module.exports = {
  requireAdmin,
  requireDoctorOrAdmin,
};
