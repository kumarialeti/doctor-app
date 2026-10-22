import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://doc-booking-online.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // send online users via socket
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Doctor initiates a video call to a specific patient
  socket.on("video-call-invite", ({ toUserId, fromDoctorName, fromDoctorId, roomId }) => {
    const receiverSocketId = userSocketMap[toUserId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-video-call", {
        fromDoctorName,
        fromDoctorId,
        roomId,
      });
    }
  });

  // Patient declines the call — notify the doctor
  socket.on("video-call-declined", ({ toDoctorId }) => {
    const doctorSocketId = userSocketMap[toDoctorId];
    if (doctorSocketId) {
      io.to(doctorSocketId).emit("call-was-declined");
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };

