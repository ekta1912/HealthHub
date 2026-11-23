const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");
const appointmentModel = require("../models/appointmentModel");
const hospitalModel = require("../models/hospitalModel");

// 1. GET ADMIN DASHBOARD STATS
const getAdminStatsController = async (req, res, next) => {
  try {
    const [totalUsers, approvedDoctors, pendingDoctors, totalAppointments, totalHospitals] = await Promise.all([
      userModel.countDocuments({}),
      doctorModel.countDocuments({ status: "approved" }),
      doctorModel.countDocuments({ status: "pending" }),
      appointmentModel.countDocuments({}),
      hospitalModel.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      message: "Admin statistics fetched successfully",
      data: {
        totalUsers,
        approvedDoctors,
        pendingDoctors,
        totalAppointments,
        totalHospitals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ALL USERS LIST
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while fetching users",
      error,
    });
  }
};

// 3. GET ALL DOCTORS LIST
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while getting doctors data",
      error,
    });
  }
};

// 4. ACCOUNT STATUS CHANGER (Approve/Reject Logic)
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;

    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status }, { new: true });
    if (!doctor) {
      return res.status(404).send({ success: false, message: "Doctor not found" });
    }

    const user = await userModel.findOne({ _id: doctor.userId });
    if (user) {
      user.notification = user.notification || [];
      user.notification.push({
        type: "doctor-account-request-updated",
        message: `Your Doctor Account Request Has Been ${status}`,
        data: {
          onClickPath: "/notification",
        },
      });

      user.isDoctor = status === "approved";
      user.role = status === "approved" ? "doctor" : "patient";
      await user.save();
    }

    res.status(201).send({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Account Status",
      error,
    });
  }
};

// 5. BLOCK USER LOGIC
const blockUserController = async (req, res) => {
  try {
    const { blockId } = req.body;
    await userModel.findByIdAndDelete(blockId);
    res.status(200).send({
      success: true,
      message: "User Blocked Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while blocking user",
      error,
    });
  }
};

module.exports = {
  getAdminStatsController,
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  blockUserController,
};
