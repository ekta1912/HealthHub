const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    contact: {
      type: String,
      default: "",
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    emergency: {
      type: Boolean,
      default: false,
    },
    bedsAvailable: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
hospitalSchema.index({ name: "text", address: "text", services: "text" });

const hospitalModel = mongoose.model("hospitals", hospitalSchema);

module.exports = hospitalModel;
