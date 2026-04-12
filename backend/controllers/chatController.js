import Message from "../models/Message.js";
import User from "../models/User.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// GET MESSAGES BETWEEN TWO USERS
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.userId;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).send({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.userId;

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    // SOCKET IO FUNCTIONALITY
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).send({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.log("Error in sendMessage controller: ", error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// GET ALL UNIQUE CHATS FOR SIDEBAR
export const getConversations = async (req, res) => {
  try {
    const loggedInUserId = req.userId;

    // Find all distinct users the logged-in user has interacted with
    const sentMessages = await Message.distinct("receiverId", { senderId: loggedInUserId });
    const receivedMessages = await Message.distinct("senderId", { receiverId: loggedInUserId });

    const conversationIds = [...new Set([...sentMessages, ...receivedMessages])];

    const conversations = await User.find({ _id: { $in: conversationIds } }).select("-password");

    res.status(200).send({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.log("Error in getConversations: ", error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};
