"use client";

import { useEffect, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  senderName?: string; // Optional: if you want to display names
}

export function useSocket({ chatId }: { chatId: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  console.log("Initializing socket connection for chatId:", chatId);

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000" // Ensure this matches your backend port
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", socketInstance.id);
      // Authenticate with server
      const token = localStorage.getItem("token");
      if (token) {
        socketInstance.emit("authenticate", { token });
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socketInstance.on("message", (message: Message) => {
      console.log("New message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on("messageHistory", (history: Message[]) => {
      console.log("Message history received:", history);
      setMessages(history);
    });

    // Handle authentication failure
    socketInstance.on("unauthorized", (error) => {
      console.error("Socket authentication failed:", error.message);
      // Optionally, handle this by logging the user out or showing a message
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = useCallback(
    (content: string): boolean => {
      if (!socket || !isConnected) {
        console.warn("Socket not connected or available for sending message");
        return false;
      }

      // The backend will now use the authenticated userId as senderId
      socket.emit("sendMessage", { content });
      return true;
    },
    [socket, isConnected]
  );

  return {
    messages,
    sendMessage,
    isConnected,
    socket, // Exposing socket might be useful for advanced cases or debugging
  };
}
