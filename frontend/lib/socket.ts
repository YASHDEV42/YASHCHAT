"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  chatId: string;
  receiverId?: string;
  timestamp: Date;
  senderName?: string;
}

export function useSocket(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("useSocket effect triggered with chatId:", chatId);
    if (!chatId) return;

    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      { transports: ["websocket"] }
    );

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("Connected to socket:", socketInstance.id);
      setIsConnected(true);

      const token = localStorage.getItem("token");
      if (token) {
        socketInstance.emit("authenticate", { token });

        socketInstance.once("authenticated", () => {
          socketInstance.emit("join", chatId);
        });
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket");
      setIsConnected(false);
    });

    socketInstance.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on("messageHistory", (history: Message[]) => {
      setMessages(history);
    });

    socketInstance.on("unauthorized", (error) => {
      console.error("Unauthorized:", error.message);
      setIsConnected(false);
      localStorage.removeItem("token");
      router.push("/login");
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [chatId]);

  const sendMessage = useCallback(
    (content: string, receiverId: string) => {
      if (!socketRef.current || !isConnected) return false;
      console.log("Sending message:", content);
      console.log("Chat ID:", chatId);
      console.log("Receiver ID:", receiverId);
      socketRef.current.emit("sendMessage", {
        content,
        chatId,
        receiverId,
      });

      return true;
    },
    [isConnected, chatId]
  );

  return {
    messages,
    sendMessage,
    isConnected,
  };
}
