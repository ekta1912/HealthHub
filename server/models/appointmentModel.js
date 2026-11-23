const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    doctorInfo: {
      type: Object,
      required: true,
    },
    userInfo: {
      type: Object,
      required: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "booked", "cancelled"],
      default: "booked", // Immediately confirmed like reference standard
    },
    type: {
      type: String,
      enum: ["clinic", "video"],
      default: "clinic",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    cancelledBy: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for slot conflict lookups and double booking prevention
appointmentSchema.index({ doctorId: 1, date: 1, time: 1, status: 1 });

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;
