const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

module.exports = function socketSetup(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected (unauthenticated):", socket.id);

    socket.on("authenticate", (data) => {
      const { token } = data;
      if (!token) {
        return socket.emit("unauthorized", { message: "No token provided" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded:", decoded);
        socket.userId = decoded._id;
        socket.userName = decoded.username;

        console.log(
          `User ${socket.userName} (ID: ${socket.userId}) authenticated for socket: ${socket.id}`
        );

        socket.emit("authenticated");
      } catch (err) {
        console.error("Socket authentication error:", err.message);
        socket.emit("unauthorized", { message: "Invalid token" });

        socket.disconnect();
      }
    });

    socket.on("join", async ({ chatId }) => {
      if (!socket.userId) {
        return console.warn("Unauthenticated socket tried to join a room.");
      }

      socket.join(chatId);
      console.log(`User ${socket.userName} joined chat room: ${chatId}`);

      try {
        const messages = await Message.find({ chatId })
          .sort({ createdAt: 1 })
          .limit(50)
          .populate("sender", "username");

        const chatMessages = messages.map((msg) => ({
          _id: msg._id,
          sender: msg.sender._id,
          senderName: msg.sender.username,
          content: msg.content,
          createdAt: msg.createdAt,
          receiver: msg.receiver,
          chatId: msg.chatId,
          timestamp: msg.createdAt.toISOString(),
          // Ensure timestamp is in ISO format for consistency
        }));
        console.log(
          `Loaded ${chatMessages.length} messages for chat room: ${chatId}`
        );
        socket.emit("messageHistory", chatMessages);
      } catch (error) {
        console.error("Error fetching message history:", error);
        socket.emit("error", { message: "Failed to load messages" });
      }
    });

    socket.on("sendMessage", async ({ content, chatId, receiverId }) => {
      if (!socket.userId) {
        return console.warn("Unauthenticated user tried to send a message");
      }
      if (!content || !chatId) {
        return socket.emit("error", {
          message: "Content and chatId are required",
        });
      }
      try {
        const newMessage = new Message({
          sender: socket.userId,
          content,
          chatId,
          receiver: receiverId,
          createdAt: new Date(),
        });

        await newMessage.save();

        // Populate sender for sending to clients
        const populatedMessage = await Message.populate(newMessage, {
          path: "sender",
          select: "username",
        });

        const messageToSend = {
          _id: populatedMessage._id,
          sender: populatedMessage.sender._id,
          senderName: populatedMessage.sender.username,
          content: populatedMessage.content,
          createdAt: populatedMessage.createdAt,
        };

        io.to(chatId).emit("message", messageToSend);

        console.log(
          `Message in chat ${chatId} from ${messageToSend.senderName}: ${messageToSend.content}`
        );
      } catch (error) {
        console.error("Error saving message to database:", error);
        socket.emit("error", { message: "Failed to save message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  console.log("Socket.IO server initialized.");
  return io;
};
