"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "@/components/chat-sidebar";
import ChatInterface from "@/components/chat-interface";
import { getCurrentUser, type User } from "@/lib/auth";

export type Chat = {
  _id: string;
  users: User[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
};

export default function ChatApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const token = localStorage.getItem("token") || "";
      const user = getCurrentUser(token);
      setCurrentUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/chats/user/" + user.id,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }
        const data: Chat[] = await response.json();
        setChats(data);
        if (data.length > 0 && !selectedChat) {
          setSelectedChat(data[0]);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    // Mark messages as read
    setChats((prevChats) =>
      prevChats.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-foreground">Please log in to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        currentUser={currentUser}
        loading={loading}
      />
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatInterface chat={selectedChat} currentUser={currentUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
              <p className="text-xl mb-2">Welcome to ChatConnect</p>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
