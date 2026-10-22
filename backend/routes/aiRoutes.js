import express from "express";
import { checkSymptoms } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check-symptoms", authMiddleware, checkSymptoms);

export default router;
