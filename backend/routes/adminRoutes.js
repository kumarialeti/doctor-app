import express from "express";
import {
  getAllUsers,
  getAllDoctors,
  getAllAppointments,
  changeAccountStatus,
  getAnalytics
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get-all-users", authMiddleware, getAllUsers);
router.get("/get-all-doctors", authMiddleware, getAllDoctors);
router.get("/get-all-appointments", authMiddleware, getAllAppointments);
router.post("/change-account-status", authMiddleware, changeAccountStatus);
router.get("/analytics", authMiddleware, getAnalytics);

export default router;