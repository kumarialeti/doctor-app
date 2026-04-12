import express from "express";
import { bookAppointment, getAppointments } from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/book", protect, bookAppointment);   // 🔐 protected
router.get("/", protect, getAppointments);

export default router;