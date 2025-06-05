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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    // Mark messages as read
    setChats((prevChats) =>
      prevChats.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleStartNewChat = async (userId: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/chats/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const newChat: Chat = await response.json();
      setChats((prev) => [...prev, newChat]);
      setSelectedChat(newChat);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token") || "";
      const user = getCurrentUser(token);
      setCurrentUser(user);
      console.log("Current user:", user);
      if (!user) {
        return;
      }

      try {
        // Fetch all users
        const usersResponse = await fetch("http://localhost:5000/api/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData: User[] = await usersResponse.json();

        const filteredUsers = usersData.filter(
          (u) => u.username !== user.username
        );
        console.log("Fetched users:", filteredUsers);
        setAllUsers(filteredUsers);

        const chatsResponse = await fetch(
          "http://localhost:5000/api/chats/user/" + user._id,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!chatsResponse.ok) {
          throw new Error("Failed to fetch chats");
        }
        const chatsData: Chat[] = await chatsResponse.json();
        setChats(chatsData);

        if (chatsData.length > 0) {
          setSelectedChat(chatsData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

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
        loading={false}
        allUsers={allUsers}
        onStartNewChat={handleStartNewChat}
        loadingUsers={false}
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
