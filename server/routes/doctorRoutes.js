const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireDoctorOrAdmin } = require("../middlewares/roleMiddleware");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} = require("../controllers/doctorController");

const router = express.Router();

// POST SINGLE DOCTOR INFO
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

// POST UPDATE PROFILE
router.post("/updateProfile", authMiddleware, requireDoctorOrAdmin, updateProfileController);

// POST/GET GET SINGLE DOCTOR BY ID (Booking view)
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);
router.get("/:id", authMiddleware, getDoctorByIdController);

// GET APPOINTMENTS (Doctor Only)
router.get("/doctor-appointments", authMiddleware, requireDoctorOrAdmin, doctorAppointmentsController);

// POST UPDATE STATUS (Approve/Reject/Cancel)
router.post("/update-status", authMiddleware, requireDoctorOrAdmin, updateStatusController);

module.exports = router;
