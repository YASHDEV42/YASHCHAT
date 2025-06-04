"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Menu } from "lucide-react";
import type { Chat } from "@/components/chat-app";
import type { User } from "@/lib/auth";

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  currentUser: User;
  loading: boolean;
}

export default function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  currentUser,
  loading,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.users.find((user) => user.id !== currentUser.id);
    return otherUser?.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  // Get the other user in a chat (not the current user)
  const getOtherUser = (chat: Chat) => {
    return (
      chat.users.find((user) => user.id !== currentUser.id) || chat.users[0]
    );
  };

  // Format timestamp to readable time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-muted/50 flex justify-between items-center border-b">
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={"/placeholder.svg?height=36&width=36"}
              alt={currentUser.username || "User Avatar"}
            />
            <AvatarFallback>
              {currentUser.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="ml-2 font-medium">{currentUser.username}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b bg-background">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto bg-background">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading chats...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No chats match your search" : "No chats yet"}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat);
            return (
              <div
                key={chat.id}
                className={`flex items-center p-3 cursor-pointer hover:bg-muted/50 border-b ${
                  selectedChat?.id === chat.id ? "bg-muted/50" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={"/placeholder.svg?height=48&width=48"}
                    alt={otherUser.username}
                  />
                  <AvatarFallback>
                    {otherUser.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">
                      {otherUser.username}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage?.content || "Start a conversation"}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
