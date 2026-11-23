const express = require("express");
const {
  getAdminStatsController,
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  blockUserController,
} = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");

const router = express.Router();

// GET STATS (Admin Dashboard Metrics)
router.get("/stats", authMiddleware, requireAdmin, getAdminStatsController);
router.get("/dashboard-stats", authMiddleware, requireAdmin, getAdminStatsController);

// GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, requireAdmin, getAllUsersController);

// GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, requireAdmin, getAllDoctorsController);

// POST ACCOUNT STATUS || APPROVE/REJECT
router.post("/changeAccountStatus", authMiddleware, requireAdmin, changeAccountStatusController);

// POST || BLOCK USER
router.post("/blockUser", authMiddleware, requireAdmin, blockUserController);

module.exports = router;
