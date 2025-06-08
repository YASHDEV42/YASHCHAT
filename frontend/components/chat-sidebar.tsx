"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import type { Chat } from "@/components/chat-app";
import type { User } from "@/lib/auth";

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  currentUser: User;
  loading: boolean;
  allUsers?: User[];
  onStartNewChat?: (userId: string) => void;
  loadingUsers?: boolean;
}

export default function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  currentUser,
  loading,
  allUsers = [],
  onStartNewChat,
  loadingUsers = false,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.users.find((user) => user._id !== currentUser._id);
    return otherUser?.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const filteredUsers = allUsers.filter((user) => {
    if (user._id === currentUser._id) return false;

    const hasExistingChat = chats.some((chat) =>
      chat.users.some((chatUser) => chatUser._id === user._id)
    );

    if (hasExistingChat) return false;

    return user.username.toLowerCase().includes(userSearchQuery.toLowerCase());
  });

  const getOtherUser = (chat: Chat) => {
    return (
      chat.users.find((user) => user._id !== currentUser._id) || chat.users[0]
    );
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(date));
  };

  const handleStartNewChat = (userId: string) => {
    onStartNewChat?.(userId);
    setIsNewChatOpen(false);
    setUserSearchQuery("");
  };

  return (
    <div className="w-80 sm:w-72 md:w-80 border-r bg-background flex flex-col h-full shadow-lg md:shadow-none">
      {/* Header */}
      <div className="p-4 bg-muted/50 flex justify-between items-center border-b">
        <div className="flex items-center min-w-0">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage
              src={"/placeholder.svg?height=36&width=36"}
              alt={currentUser.username || "User Avatar"}
            />
            <AvatarFallback>
              {currentUser.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="ml-2 font-medium truncate">
            {currentUser.username}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Start new chat</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>Start New Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>

                <div className="max-h-80 overflow-y-auto space-y-1">
                  {loadingUsers ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading users...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {userSearchQuery
                        ? "No users match your search"
                        : "No new users to chat with"}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <Button
                        key={user._id}
                        variant="ghost"
                        className="justify-start w-full h-auto p-3"
                        onClick={() => handleStartNewChat(user._id)}
                      >
                        <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                          <AvatarImage
                            src="/placeholder.svg?height=40&width=40"
                            alt={user.username}
                          />
                          <AvatarFallback>
                            {user.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user.username}</span>
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-center px-4">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                className={`flex items-center p-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg ${
                  selectedChat?._id === chat._id ? "bg-muted" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage
                    src={"/placeholder.svg?height=40&width=40"}
                    alt={getOtherUser(chat).username || "User Avatar"}
                  />
                  <AvatarFallback>
                    {getOtherUser(chat).username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getOtherUser(chat).username}
                  </p>
                  {chat.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                  {chat.lastMessage && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatTime(chat.lastMessage.timestamp)}
                    </p>
                  )}
                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
