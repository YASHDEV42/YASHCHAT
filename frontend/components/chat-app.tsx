"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "@/components/chat-sidebar";
import ChatInterface from "@/components/chat-interface";
import { getCurrentUser, type User } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

export type Chat = {
  _id: string;
  users: User[];
  lastMessage?: {
    content: string;
    createdAt: string;
    updatedAt: string;
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);

    setSidebarOpen(false);

    setChats((prevChats) =>
      prevChats.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const refreshChats = async () => {
    const token = localStorage.getItem("token") || "";
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/chats/user/${currentUser?._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh chats");
      }

      const updatedChats: Chat[] = await response.json();
      setChats(updatedChats);

      if (
        selectedChat &&
        !updatedChats.some((chat) => chat._id === selectedChat._id)
      ) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Error refreshing chats:", error);
    }
  };

  const handleStartNewChat = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/chats/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userIds: [currentUser?._id, userId] }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const token = localStorage.getItem("token") || "";
      const updatedChatsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/chats/user/${currentUser?._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!updatedChatsResponse.ok) {
        throw new Error("Failed to refresh chats");
      }

      const updatedChats: Chat[] = await updatedChatsResponse.json();
      setChats(updatedChats);

      // ✅ Set selected chat to the one with that user
      const startedChat = updatedChats.find((chat) =>
        chat.users.some((u) => u._id === userId)
      );

      if (startedChat) {
        setSelectedChat(startedChat);
      }

      setSidebarOpen(false);
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
        const usersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/users`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
          `${process.env.NEXT_PUBLIC_API_BASE}/api/chats/user/` + user._id,
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

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("chat-sidebar");
      const menuButton = document.getElementById("sidebar-trigger");

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="chat-sidebar"
        className={`
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Sidebar Trigger */}
        <div className="md:hidden flex items-center gap-2 p-4 border-b bg-background">
          <Button
            id="sidebar-trigger"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          {selectedChat && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-medium">
                  {selectedChat.users
                    .find((user) => user._id !== currentUser._id)
                    ?.username?.charAt(0) || "U"}
                </span>
              </div>
              <span className="font-medium">
                {selectedChat.users.find((user) => user._id !== currentUser._id)
                  ?.username || "Chat"}
              </span>
            </div>
          )}
        </div>

        {selectedChat ? (
          <ChatInterface
            chat={selectedChat}
            currentUser={currentUser}
            refreshChats={refreshChats}
          />
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
