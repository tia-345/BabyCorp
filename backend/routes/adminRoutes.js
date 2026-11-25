
const express = require("express");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const {
  authenticate,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Every route below requires an admin login
router.use(authenticate, requireAdmin);

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalParents = await User.countDocuments({ role: "parent" });
    const totalProfessionals = await User.countDocuments({
      role: "professional",
    });
    const pendingApprovals = await User.countDocuments({
      role: "professional",
      verificationStatus: "pending",
    });

    res.json({
      totalUsers,
      totalParents,
      totalProfessionals,
      pendingApprovals,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load statistics." });
  }
});

// List professionals awaiting verification
router.get("/professionals/pending", async (req, res) => {
  try {
    const professionals = await User.find({
      role: "professional",
      verificationStatus: "pending",
    }).select("-password");

    res.json(professionals);
  } catch (error) {
    res.status(500).json({
      message: "Could not load professionals.",
    });
  }
});

// View a certificate securely
router.get("/professionals/:id/certificate", async (req, res) => {
  try {
    const professional = await User.findOne({
      _id: req.params.id,
      role: "professional",
    });

    if (!professional || !professional.certificateUrl) {
      return res.status(404).json({
        message: "Certificate not found.",
      });
    }

    const certificatePath = path.join(
      __dirname,
      "../private_uploads",
      path.basename(professional.certificateUrl)
    );

    if (!fs.existsSync(certificatePath)) {
      return res.status(404).json({
        message: "Certificate file is missing.",
      });
    }

    res.sendFile(certificatePath);
  } catch (error) {
    res.status(500).json({
      message: "Could not open certificate.",
    });
  }
});

// Approve a professional
router.patch("/professionals/:id/approve", async (req, res) => {
  try {
    const professional = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "professional",
        verificationStatus: "pending",
      },
      {
        verificationStatus: "approved",
        isVerified: true,
      },
      { new: true }
    ).select("-password");

    if (!professional) {
      return res.status(404).json({
        message: "Pending professional not found.",
      });
    }

    res.json({
      message: "Professional approved successfully.",
      professional,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not approve professional.",
    });
  }
});

// Reject a professional
router.patch("/professionals/:id/reject", async (req, res) => {
  try {
    const professional = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "professional",
        verificationStatus: "pending",
      },
      {
        verificationStatus: "rejected",
        isVerified: false,
      },
      { new: true }
    ).select("-password");

    if (!professional) {
      return res.status(404).json({
        message: "Pending professional not found.",
      });
    }

    res.json({
      message: "Professional rejected.",
      professional,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not reject professional.",
    });
  }
});

module.exports = router;
