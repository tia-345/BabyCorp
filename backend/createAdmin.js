
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Admin email or password missing from .env");
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      if (existingAdmin.role !== "admin") {
        throw new Error(
          "This email already belongs to a non-admin account. Choose another email."
        );
      }

      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "BabyCorp Admin",
      email,
      password: hashedPassword,
      role: "admin",
      verificationStatus: "not_required",
      isVerified: true,
    });

    console.log("BabyCorp admin account created successfully!");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
