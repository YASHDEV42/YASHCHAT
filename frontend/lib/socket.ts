"use client";

import { useEffect, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  senderName?: string;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on("messageHistory", (history: Message[]) => {
      setMessages(history);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = useCallback(
    (content: string): boolean => {
      if (!socket || !isConnected) return false;

      socket.emit("sendMessage", { content });
      return true;
    },
    [socket, isConnected]
  );

  return {
    messages,
    sendMessage,
    isConnected,
    socket,
  };
}
