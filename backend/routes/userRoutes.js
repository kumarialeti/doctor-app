import express from "express";
import {
  getUserInfo,
  applyDoctor,
  markAllNotifications,
  deleteAllNotifications,
  getAllApprovedDoctors,
  bookAppointment,
  checkAvailability,
  userAppointments,
  cancelAppointment,
  addReview
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// set up multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/get-user-info", authMiddleware, getUserInfo);
router.post("/apply-doctor", authMiddleware, applyDoctor);
router.post("/mark-all-notifications", authMiddleware, markAllNotifications);
router.post("/delete-all-notifications", authMiddleware, deleteAllNotifications);
router.get("/get-all-approved-doctors", authMiddleware, getAllApprovedDoctors);
router.post("/book-appointment", authMiddleware, upload.single("document"), bookAppointment);
router.post("/check-availability", authMiddleware, checkAvailability);
router.get("/user-appointments", authMiddleware, userAppointments);
router.post("/cancel-appointment", authMiddleware, cancelAppointment);
router.post("/add-review", authMiddleware, addReview);

export default router;
