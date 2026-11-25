
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// ------------------------------------
// PRIVATE CERTIFICATE STORAGE
// ------------------------------------

const uploadDirectory = path.join(__dirname, "../private_uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only PDF, JPG and PNG certificates are allowed.")
      );
    }

    cb(null, true);
  },
});

// ------------------------------------
// JWT COOKIE
// ------------------------------------

const createTokenCookie = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ------------------------------------
// REGISTER
// ------------------------------------

router.post(
  "/register",
  (req, res, next) => {
    upload.single("certificate")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Please fill in all required fields.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must contain at least 8 characters.",
        });
      }

      // Public registration cannot create admin accounts.
      if (!["parent", "professional"].includes(role)) {
        return res.status(400).json({
          message: "Invalid account category.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already registered.",
        });
      }

      const professional = role === "professional";

      if (
        professional &&
        (
          !req.body.profession ||
          !req.body.qualification ||
          !req.body.registrationNumber ||
          !req.body.workplace ||
          !req.file
        )
      ) {
        return res.status(400).json({
          message: "Please provide all professional details and upload your certificate.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,

        profession: professional ? req.body.profession : "",
        qualification: professional ? req.body.qualification : "",
        registrationNumber: professional
          ? req.body.registrationNumber
          : "",
        workplace: professional ? req.body.workplace : "",

        certificateUrl: professional ? req.file.filename : "",

        verificationStatus: professional
          ? "pending"
          : "not_required",

        isVerified: false,
      });

      createTokenCookie(res, user._id);

      res.status(201).json({
        message: professional
          ? "Registration successful! Your credentials are awaiting admin verification."
          : "Registration successful!",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
      });

    } catch (error) {
      console.error("Registration error:", error);

      // Remove uploaded file if registration fails.
      if (req.file) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      if (error.code === 11000) {
        return res.status(409).json({
          message: "Email already registered.",
        });
      }

      res.status(500).json({
        message: "Registration failed.",
      });
    }
  }
);

// ------------------------------------
// LOGIN
// ------------------------------------

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Enter email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "This account is inactive.",
      });
    }

    createTokenCookie(res, user._id);

    res.json({
      message: "Login successful!",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed.",
    });
  }
});

// ------------------------------------
// LOGOUT
// ------------------------------------

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({
    message: "Logged out successfully.",
  });
});

// ------------------------------------
// CURRENTLY LOGGED-IN USER
// ------------------------------------

router.get("/me", authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      verificationStatus: req.user.verificationStatus,
    },
  });
});

module.exports = router;
