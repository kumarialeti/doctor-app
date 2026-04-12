import express from "express";
import {
  getDoctorInfo,
  updateProfile,
  getDoctorById,
  doctorAppointments,
  updateStatus,
  updateConsultation
} from "../controllers/doctorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/get-doctor-info", authMiddleware, getDoctorInfo);
router.post("/update-profile", authMiddleware, updateProfile);
router.post("/get-doctor-by-id", authMiddleware, getDoctorById);
router.get("/doctor-appointments", authMiddleware, doctorAppointments);
router.post("/update-status", authMiddleware, updateStatus);
router.post("/update-consultation", authMiddleware, updateConsultation);

export default router;