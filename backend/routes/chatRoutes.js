import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMessages, sendMessage, getConversations } from "../controllers/chatController.js";

const router = express.Router();

router.get("/conversations", authMiddleware, getConversations);
router.get("/:id", authMiddleware, getMessages);
router.post("/send/:id", authMiddleware, sendMessage);

export default router;
