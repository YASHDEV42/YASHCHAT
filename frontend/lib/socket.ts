"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

// This would be your actual backend URL in production
const SOCKET_URL = "http://localhost:5000";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      const token = localStorage.getItem("token");

      if (!token) return;

      socket = io(SOCKET_URL, {
        auth: {
          token,
        },
      });
    }

    // Socket event handlers
    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Load initial messages (mock data for demo)
    setMessages([
      {
        id: "1",
        senderId: "2",
        content: "Hey there! How are you?",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "2",
        senderId: "1", // Current user
        content: "I'm good, thanks! How about you?",
        timestamp: new Date(Date.now() - 3500000),
      },
      {
        id: "3",
        senderId: "2",
        content: "Doing well! Just checking out this new chat app.",
        timestamp: new Date(Date.now() - 3400000),
      },
    ]);

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("message");
      }
    };
  }, []);

  const sendMessage = (content: string) => {
    if (!socket || !isConnected) return false;

    const newMessage: Omit<Message, "id" | "timestamp"> = {
      senderId: "1", // Current user ID
      content,
    };

    socket.emit("message", newMessage);

    const mockResponse: Message = {
      ...newMessage,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, mockResponse]);
    return true;
  };

  return {
    isConnected,
    messages,
    sendMessage,
  };
};
