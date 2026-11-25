
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["parent", "professional", "admin"],
      default: "parent",
      required: true,
    },

    // Professional details
    profession: {
      type: String,
      default: "",
    },

    qualification: {
      type: String,
      default: "",
    },

    registrationNumber: {
      type: String,
      default: "",
    },

    workplace: {
      type: String,
      default: "",
    },

    certificateUrl: {
      type: String,
      default: "",
    },

    verificationStatus: {
      type: String,
      enum: ["not_required", "pending", "approved", "rejected"],
      default: "not_required",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
