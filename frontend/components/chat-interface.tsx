"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, MoreVertical, Smile, ChevronDown } from "lucide-react";
import { useSocket, type Message } from "@/lib/socket";
import type { User } from "@/lib/auth";
import type { Chat } from "@/components/chat-app";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, AlertTriangle } from "lucide-react";

interface ChatInterfaceProps {
  chat: Chat;
  currentUser: User;
  refreshChats: () => Promise<void>;
}

export default function ChatInterface({
  chat,
  currentUser,
  refreshChats,
}: ChatInterfaceProps) {
  const { messages, sendMessage, isConnected } = useSocket(chat._id);
  const [newMessage, setNewMessage] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  console.log("messages", messages);

  const otherUser =
    chat.users.find((user) => user._id !== currentUser._id) || chat.users[0];
  console.log("otherUser", otherUser);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;
    console.log("chat._id", chat._id);
    console.log("otherUser._id", otherUser._id);
    console.log("currentUser._id", currentUser._id);

    const success = sendMessage(newMessage, otherUser._id);
    if (success) {
      setNewMessage("");
    }
  };

  const formatTime = (dateInput: string | Date) => {
    const time = new Date(dateInput);
    if (isNaN(time.getTime())) return "Invalid time";

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(time);
  };

  const formatDate = (dateInput: string | Date) => {
    const messageDate = new Date(dateInput);
    if (isNaN(messageDate.getTime())) return "Invalid date";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDate = (d1: Date, d2: Date) =>
      d1.toDateString() === d2.toDateString();

    if (isSameDate(messageDate, today)) return "Today";
    if (isSameDate(messageDate, yesterday)) return "Yesterday";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(messageDate);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = formatDate(new Date(message.timestamp || message.createdAt));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleDeleteChatClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteChat = async () => {
    try {
      if (!chat || !currentUser) {
        console.error("Chat or current user is not defined");
        return;
      }

      setIsDeleting(true);

      console.log("Deleting chat:", chat._id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/chats/${chat._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      // Close dialog and reset state
      setShowDeleteDialog(false);
      setIsDeleting(false);

      await refreshChats();

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }

      console.log("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setIsDeleting(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showEmojiPicker && !target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <>
      <Card className="flex flex-col h-full rounded-none border-0 bg-background">
        {/* Desktop Header */}
        <CardHeader className="hidden md:flex border-b px-4 bg-background">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage
                  src={"/placeholder.svg?height=40&width=40"}
                  alt={otherUser.username}
                />
                <AvatarFallback>
                  {otherUser?.username?.charAt(0) ?? ""}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="font-medium">{otherUser.username}</div>
                <div className="text-xs text-muted-foreground">
                  {isConnected ? "Online" : "Offline"}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleDeleteChatClick}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-1 relative bg-background p-0">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto p-4 scroll-smooth"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupMessagesByDate(messages).map(([date, dateMessages]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex justify-center">
                      <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                        {date}
                      </span>
                    </div>

                    {dateMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.sender?.toString() ===
                          currentUser._id.toString()
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender.toString() ===
                            currentUser._id.toString()
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div
                            className={`text-xs text-right mt-1 ${
                              message.sender?.toString() ===
                              currentUser._id.toString()
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatTime(message.timestamp || message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 rounded-full h-10 w-10 shadow-lg"
              size="icon"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </CardContent>

        <CardFooter className="border-t p-3 bg-background">
          <form
            onSubmit={handleSendMessage}
            className="flex w-full gap-2 items-center"
          >
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground h-8 w-8"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>

              {showEmojiPicker && (
                <div className="absolute bottom-10 left-0 z-10 shadow-lg rounded-lg emoji-picker-container">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
            <Input
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!isConnected || !newMessage.trim()}
              className="rounded-full h-8 w-8"
            >
              <Send className="h-3 w-3" />
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteDialog(false);
            setIsDeleting(false);
          } else {
            setShowDeleteDialog(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-left">Delete Chat</DialogTitle>
                <DialogDescription className="text-left">
                  Are you sure you want to delete this chat with{" "}
                  <span className="font-medium">{otherUser.username}</span>?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This action cannot be undone. All messages in this conversation will
            be permanently deleted.
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChat}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
