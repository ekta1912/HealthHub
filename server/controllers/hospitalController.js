const hospitalModel = require("../models/hospitalModel");

// 1. GET ALL HOSPITALS (Supports search & filtering)
const getAllHospitalsController = async (req, res, next) => {
  try {
    const { search, emergency, service } = req.query;
    const filter = {};

    if (emergency === "true") {
      filter.emergency = true;
    }

    if (service) {
      filter.services = { $in: [new RegExp(service, "i")] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { services: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    const hospitals = await hospitalModel.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Hospitals fetched successfully",
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET SINGLE HOSPITAL DETAILS
const getHospitalByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hospital = await hospitalModel.findById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hospital details fetched",
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE HOSPITAL LISTING (Doctors & Admins)
const createHospitalController = async (req, res, next) => {
  try {
    const { name, address, description, services, contact, latitude, longitude, emergency, bedsAvailable } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: "Hospital name and address are required",
      });
    }

    const newHospital = new hospitalModel({
      name: name.trim(),
      address: address.trim(),
      description: (description || "").trim(),
      services: Array.isArray(services) ? services : typeof services === "string" ? services.split(",").map((s) => s.trim()).filter(Boolean) : [],
      contact: (contact || "").trim(),
      latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
      longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
      emergency: Boolean(emergency),
      bedsAvailable: bedsAvailable ? parseInt(bedsAvailable, 10) : 0,
      createdBy: req.userId || "authorized_user",
    });

    const saved = await newHospital.save();

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE HOSPITAL
const updateHospitalController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.services && typeof updates.services === "string") {
      updates.services = updates.services.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const updated = await hospitalModel.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE HOSPITAL
const deleteHospitalController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await hospitalModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hospital deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHospitalsController,
  getHospitalByIdController,
  createHospitalController,
  updateHospitalController,
  deleteHospitalController,
};
