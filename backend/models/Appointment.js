import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    doctorInfo: { type: Object, required: true },
    userInfo: { type: Object, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    document: { type: String, default: "" },
    status: { type: String, default: "pending" },
    notes: { type: String, default: "" },
    prescription: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);