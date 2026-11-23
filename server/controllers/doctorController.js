const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModel");

// 1. GET SINGLE DOCTOR INFO BY USER ID
const getDoctorInfoController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const doctor = await doctorModel.findOne({ userId });

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// 2. UPDATE DOCTOR PROFILE
const updateProfileController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const doctor = await doctorModel.findOneAndUpdate(
      { userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Doctor Profile Updated Successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET SINGLE DOCTOR BY ID
const getDoctorByIdController = async (req, res, next) => {
  try {
    const doctorId = req.body.doctorId || req.params.id;
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Single Doc Info Fetched",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET DOCTOR APPOINTMENTS
const doctorAppointmentsController = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    const doctor = await doctorModel.findOne({ userId });

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor account not found",
      });
    }

    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    }).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Doctor Appointments Fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// 5. STATUS UPDATE (APPROVE/REJECT/CANCEL)
const updateStatusController = async (req, res, next) => {
  try {
    const { appointmentsId, status, reason } = req.body;

    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      {
        status,
        cancellationReason: status === "cancelled" || status === "rejected" ? reason || `Status set to ${status}` : "",
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    // Notify Patient
    const user = await userModel.findById(appointment.userId);
    if (user) {
      user.notification = user.notification || [];
      user.notification.push({
        type: "status-updated",
        message: `Your appointment with Dr. ${appointment.doctorInfo?.firstName || ""} has been ${status}`,
        onClickPath: "/appointments",
      });
      await user.save();
    }

    res.status(200).send({
      success: true,
      message: `Appointment Status Updated to ${status}`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};
