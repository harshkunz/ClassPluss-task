import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["google", "email", "guest"],
      default: "guest",
    },
    providerId: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
    },
    profileImageUrl: {
      type: String,
      trim: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    currentPlan: {
      type: String,
      default: "free",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
