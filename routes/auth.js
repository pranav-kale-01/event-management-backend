const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();
const User = require("../models/user");
const authenticateToken = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const EMAIL_USER = process.env.EMAIL_USER; // Your email for Nodemailer
const EMAIL_PASS = process.env.EMAIL_PASS; // Your email password for Nodemailer

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

router.get("/user/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// Add event to liked events
router.post("/edit_user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { likedEvents, registeredEvents, _id, email, password, userType }=req.body;

    // Update the event
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { likedEvents, registeredEvents, _id, email, password, userType },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event liked successfully", event: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to send OTP
router.post("/otp/sendOtp", async (req, res) => {
  const { email } = req.body;

  // Check if user already exists
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP in temporary storage
  otpStorage[email] = otp;

  // Send OTP email
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP is: ${otp}. This code is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
});

// Endpoint to verify OTP
router.post("/otp/verifyOtp", (req, res) => {
  const { email, otp } = req.body;

  // Verify OTP
  if (otpStorage[email] && otpStorage[email] === otp) {
    delete otpStorage[email]; // Remove OTP once verified
    res.status(200).json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid or expired OTP" });
  }
});

// User registration endpoint (unchanged)
router.post("/register", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Check if user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      userType: userType,
    });
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

// Login endpoint (unchanged)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    var user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User Not Found" });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid email or password" });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    user = await User.findById(user._id)
      .populate("likedEvents", "_id")
      .populate("registeredEvents");

    res.json({ message: "Login successful", token, user: user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

module.exports = router;
