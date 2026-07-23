import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/emailService.js";
import welcomeEmail from "../templates/welcomeEmail.js";
import crypto from "crypto";
import resetPasswordEmail from "../templates/resetPasswordEmail.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(400, "Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await sendEmail(
      user.email,
      "Welcome to FreshBite 🎉",
      welcomeEmail(user.name)
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });
});

// Login User

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
  throw new ApiError(400, "Email and password are required");
}

    const user = await User.findOne({ email });

    if (!user) {
  throw new ApiError(404, "User not found");
}

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new ApiError(400, "Invalid Credentials");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      token,
      user: userResponse,
    });

});

// profile
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });

});


export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Email Required
    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    // User Exists
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Your FreshBite Password 🔐",
      resetPasswordEmail(user.name, resetLink)
    );

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });

});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new ApiError(400, "Password is required");
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  
});