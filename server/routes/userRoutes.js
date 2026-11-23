const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { authLimiter, bookingLimiter } = require("../middlewares/rateLimiter");

const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  userAppointmentsController,
  bookingAvailabilityController,
  cancelAppointmentController,
  updateUserProfileController,
} = require("../controllers/userController");

const router = express.Router();

// LOGIN || POST (Rate Limited)
router.post("/login", authLimiter, loginController);

// REGISTER || POST (Rate Limited)
router.post("/register", authLimiter, registerController);

// AUTH / GET USER DATA || POST
router.post("/getUserData", authMiddleware, authController);

// APPLY DOCTOR || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

// NOTIFICATIONS || POST
router.post("/get-all-notification", authMiddleware, getAllNotificationController);
router.post("/delete-all-notification", authMiddleware, deleteAllNotificationController);

// GET ALL APPROVED DOCTORS || GET
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

// BOOK APPOINTMENT || POST (Rate Limited)
router.post("/book-appointment", authMiddleware, bookingLimiter, bookAppointmentController);

// CHECK BOOKING AVAILABILITY || POST
router.post("/booking-availbility", authMiddleware, bookingAvailabilityController);
router.post("/booking-availability", authMiddleware, bookingAvailabilityController);

// GET USER APPOINTMENTS || GET
router.get("/user-appointments", authMiddleware, userAppointmentsController);

// CANCEL APPOINTMENT || POST
router.post("/cancel-appointment", authMiddleware, cancelAppointmentController);

// UPDATE USER PROFILE || POST
router.post("/update-profile", authMiddleware, updateUserProfileController);

module.exports = router;
