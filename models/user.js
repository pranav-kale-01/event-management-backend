const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true },
    likedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }], // Store liked event IDs
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }], // Store
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
