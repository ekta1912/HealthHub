const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");
const appointmentModel = require("../models/appointmentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. REGISTER CALLBACK
const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send({ message: "Please provide name, email, and password", success: false });
    }

    if (password.length < 6) {
      return res.status(400).send({ message: "Password must be at least 6 characters long", success: false });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(200).send({ message: "User Already Exist", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      ...req.body,
      email: normalizedEmail,
      password: hashedPassword,
      isAdmin: false, // Security safeguard: cannot escalate privileges on public register
      isDoctor: false,
      role: "patient",
    });
    await newUser.save();
    res.status(201).send({ message: "Register Successfully", success: true });
  } catch (error) {
    next(error);
  }
};

// 2. LOGIN CALLBACK
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required", success: false });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid Email or Password", success: false });
    }

    const secret = process.env.JWT_SECRET || "healthhub_default_secret_key_2026";
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || (user.isAdmin ? "admin" : user.isDoctor ? "doctor" : "patient"),
        isAdmin: user.isAdmin,
        isDoctor: user.isDoctor,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).send({
      message: "Login Success",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDoctor: user.isDoctor,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. AUTH CALLBACK (Current User Data Fetch)
const authController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(200).send({
        message: "User not found",
        success: false,
      });
    }

    user.password = undefined;
    res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 4. APPLY DOCTOR
const applyDoctorController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;

    // Check if application already exists
    const existing = await doctorModel.findOne({ userId });
    if (existing) {
      if (existing.status === "approved") {
        return res.status(200).send({ success: false, message: "You are already an approved doctor" });
      } else if (existing.status === "pending") {
        return res.status(200).send({ success: false, message: "Your application is already pending review" });
      }
    }

    const newDoctor = new doctorModel({
      ...req.body,
      userId,
      status: "pending",
    });
    await newDoctor.save();

    // Send notification to all admins
    const admins = await userModel.find({ isAdmin: true });
    for (const admin of admins) {
      admin.notification = admin.notification || [];
      admin.notification.push({
        type: "apply-doctor-request",
        message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: newDoctor._id,
          name: `${newDoctor.firstName} ${newDoctor.lastName}`,
          onClickPath: "/admin/doctors",
        },
      });
      await admin.save();
    }

    res.status(201).send({
      success: true,
      message: "Doctor Account Applied Successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 5. NOTIFICATIONS: MARK ALL AS READ
const getAllNotificationController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    user.seennotification = user.seennotification || [];
    if (Array.isArray(user.notification)) {
      user.seennotification.push(...user.notification);
    }
    user.notification = [];

    const updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// 6. NOTIFICATIONS: DELETE ALL SEEN
const deleteAllNotificationController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).send({
      success: true,
      message: "Notifications Deleted Successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET ALL APPROVED DOCTORS
const getAllDoctorsController = async (req, res, next) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" }).sort({ firstName: 1 });
    res.status(200).send({
      success: true,
      message: "Doctors Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// 8. BOOK APPOINTMENT (With Double-Booking Prevention)
const bookAppointmentController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).send({
        success: false,
        message: "Doctor ID, date, and time are required",
      });
    }

    const cleanDate = date.trim();
    const cleanTime = time.trim();

    // Check for double-booking conflict (ignoring cancelled)
    const conflict = await appointmentModel.findOne({
      doctorId,
      date: cleanDate,
      time: cleanTime,
      status: { $in: ["booked", "approved", "pending"] },
    });

    if (conflict) {
      return res.status(200).send({
        success: false,
        message: "Slot Conflict: This appointment slot is already booked. Please choose another time.",
      });
    }

    // Retrieve doctor info if not in payload
    let doctorInfo = req.body.doctorInfo;
    if (!doctorInfo) {
      const doc = await doctorModel.findById(doctorId);
      if (doc) doctorInfo = doc.toObject();
    }

    // Retrieve user info if not in payload
    let userInfo = req.body.userInfo;
    if (!userInfo) {
      const u = await userModel.findById(userId, { password: 0 });
      if (u) userInfo = u.toObject();
    }

    const newAppointment = new appointmentModel({
      userId,
      doctorId,
      doctorInfo: doctorInfo || {},
      userInfo: userInfo || {},
      date: cleanDate,
      time: cleanTime,
      status: "booked", // Immediately confirmed like HealthEase reference
      type: req.body.type || "clinic",
    });

    await newAppointment.save();

    // Notify Doctor
    if (doctorInfo && doctorInfo.userId) {
      const doctorUser = await userModel.findById(doctorInfo.userId);
      if (doctorUser) {
        doctorUser.notification = doctorUser.notification || [];
        doctorUser.notification.push({
          type: "new-appointment-request",
          message: `New Appointment booked by ${userInfo?.name || "Patient"} for ${cleanDate} at ${cleanTime}`,
          onClickPath: "/doctor-appointments",
          appointmentId: newAppointment._id,
        });
        await doctorUser.save();
      }
    }

    res.status(200).send({
      success: true,
      message: "Appointment Booked Successfully",
      data: newAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// 9. GET USER APPOINTMENTS
const userAppointmentsController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const appointments = await appointmentModel.find({ userId }).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Users Appointments Fetched Successfully",
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// 10. CHECK BOOKING AVAILABILITY
const bookingAvailabilityController = async (req, res, next) => {
  try {
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).send({
        success: false,
        message: "Doctor ID, date, and time are required",
      });
    }

    const cleanDate = date.trim();
    const cleanTime = time.trim();

    // Look for active conflicting bookings (cancelled do not conflict)
    const conflict = await appointmentModel.findOne({
      doctorId,
      date: cleanDate,
      time: cleanTime,
      status: { $in: ["booked", "approved", "pending"] },
    });

    if (conflict) {
      return res.status(200).send({
        success: false,
        message: "Doctor is not available at this time",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Slot is Available! You can book now.",
    });
  } catch (error) {
    next(error);
  }
};

// 11. CANCEL APPOINTMENT (Patient or Doctor)
const cancelAppointmentController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const { appointmentId, reason } = req.body;

    if (!appointmentId) {
      return res.status(400).send({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    // Permission check: only patient who booked it, the assigned doctor, or an admin can cancel
    const currentUser = await userModel.findById(userId);
    const isOwner = appointment.userId === String(userId);
    const isDoctor = appointment.doctorInfo?.userId === String(userId);
    const isAdmin = currentUser?.isAdmin;

    if (!isOwner && !isDoctor && !isAdmin) {
      return res.status(403).send({
        success: false,
        message: "Forbidden: You are not authorized to cancel this appointment",
      });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = reason || "Cancelled by user";
    appointment.cancelledBy = isOwner ? "patient" : isDoctor ? "doctor" : "admin";
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Notify the other party
    if (isOwner && appointment.doctorInfo?.userId) {
      // Patient cancelled -> Notify doctor
      const doctorUser = await userModel.findById(appointment.doctorInfo.userId);
      if (doctorUser) {
        doctorUser.notification = doctorUser.notification || [];
        doctorUser.notification.push({
          type: "appointment-cancelled",
          message: `Appointment for ${appointment.date} at ${appointment.time} was cancelled by ${currentUser?.name || "patient"}.`,
          onClickPath: "/doctor-appointments",
        });
        await doctorUser.save();
      }
    } else if (isDoctor) {
      // Doctor cancelled -> Notify patient
      const patientUser = await userModel.findById(appointment.userId);
      if (patientUser) {
        patientUser.notification = patientUser.notification || [];
        patientUser.notification.push({
          type: "appointment-cancelled",
          message: `Your appointment with Dr. ${appointment.doctorInfo?.firstName || ""} for ${appointment.date} at ${appointment.time} has been cancelled.`,
          onClickPath: "/appointments",
        });
        await patientUser.save();
      }
    }

    res.status(200).send({
      success: true,
      message: "Appointment Cancelled Successfully. Slot has been freed.",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// 12. UPDATE USER PROFILE
const updateUserProfileController = async (req, res, next) => {
  try {
    const targetUserId = req.userId || req.body.userId;
    const { name, email, phone, address, bloodGroup, dateOfBirth, medicalHistory } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup.trim();
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory;

    const user = await userModel.findByIdAndUpdate(targetUserId, updateData, { new: true });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
