// backend/socket/index.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken"); // For verifying JWT

// In-memory message store (replace with DB in production)
const messages = [];

module.exports = function socketSetup(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected (unauthenticated):", socket.id);

    // Listen for 'authenticate' event
    socket.on("authenticate", (data) => {
      const { token } = data;
      if (!token) {
        return socket.emit("unauthorized", { message: "No token provided" });
      }

      try {
        // Verify the token
        // Ensure JWT_SECRET is set in your .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to the socket session
        socket.userId = decoded.id; // Assuming your JWT payload has an 'id' field
        socket.userName = decoded.username;
        console.log(
          `User ${socket.userName} (ID: ${socket.userId}) authenticated for socket: ${socket.id}`
        );

        // Send message history now that user is authenticated
        socket.emit("messageHistory", messages);
      } catch (err) {
        console.error("Socket authentication error:", err.message);
        socket.emit("unauthorized", { message: "Invalid token" });
        socket.disconnect(); // Optionally disconnect if auth fails
      }
    });

    // Listen for 'sendMessage' from an authenticated client
    socket.on("sendMessage", (data) => {
      if (!socket.userId) {
        // Should not happen if 'authenticate' is required before sending messages
        return console.warn(
          "sendMessage received from unauthenticated socket:",
          socket.id
        );
      }

      const message = {
        id: new Date().getTime().toString(),
        senderId: socket.userId, // Use the authenticated user's ID
        senderName: socket.userName || "User", // Use authenticated user's name
        content: data.content,
        timestamp: new Date(),
      };
      messages.push(message);
      io.emit("message", message); // Broadcast to all clients
      console.log(
        `Message from ${message.senderName} (ID: ${message.senderId}) broadcasted: ${message.content}`
      );
    });

    socket.on("disconnect", () => {
      if (socket.userName) {
        console.log(
          `User ${socket.userName} (ID: ${socket.userId}) disconnected from socket: ${socket.id}`
        );
      } else {
        console.log("Unauthenticated user disconnected:", socket.id);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  console.log("Socket.IO server initialized and awaiting connections.");
};
