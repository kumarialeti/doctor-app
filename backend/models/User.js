import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isDoctor: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    type: { type: String, default: "patient" },
    phone: { type: String },
    notification: { type: Array, default: [] },
    seenNotifications: { type: Array, default: [] },
    resetOTP: { type: String, default: null },
    resetOTPExpiry: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);