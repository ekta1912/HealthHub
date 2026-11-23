const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireDoctorOrAdmin, requireAdmin } = require("../middlewares/roleMiddleware");
const {
  getAllHospitalsController,
  getHospitalByIdController,
  createHospitalController,
  updateHospitalController,
  deleteHospitalController,
} = require("../controllers/hospitalController");

const router = express.Router();

// GET ALL HOSPITALS (Authenticated)
router.get("/", authMiddleware, getAllHospitalsController);

// GET SINGLE HOSPITAL BY ID (Authenticated)
router.get("/:id", authMiddleware, getHospitalByIdController);

// CREATE HOSPITAL (Doctor or Admin)
router.post("/", authMiddleware, requireDoctorOrAdmin, createHospitalController);

// UPDATE HOSPITAL (Doctor or Admin)
router.put("/:id", authMiddleware, requireDoctorOrAdmin, updateHospitalController);

// DELETE HOSPITAL (Admin Only)
router.delete("/:id", authMiddleware, requireAdmin, deleteHospitalController);

module.exports = router;
