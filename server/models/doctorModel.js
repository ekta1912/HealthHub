const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      index: true,
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
    },
    feesPerCunsultation: {
      type: Number,
      required: [true, "Fee is required"],
    },
    hospital: {
      type: String,
      default: "HealthHub Central Clinic",
      trim: true,
    },
    department: {
      type: String,
      default: "General Practice",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    timings: {
      type: Object,
      required: [true, "Work timing is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Text search index for doctor searching
doctorSchema.index({ firstName: "text", lastName: "text", specialization: "text", hospital: "text" });

const doctorModel = mongoose.model("doctors", doctorSchema);
module.exports = doctorModel;
