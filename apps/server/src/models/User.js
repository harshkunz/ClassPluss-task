const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    provider: {
      type: String,
      enum: ["email", "google", "guest"],
      required: true,
    },
    googleSub: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      trim: true,
    },
    profileImageUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
