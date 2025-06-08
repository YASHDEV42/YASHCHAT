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
import { Send, Paperclip, MoreVertical, Smile } from "lucide-react";
import { useSocket, type Message } from "@/lib/socket";
import type { User } from "@/lib/auth";
import type { Chat } from "@/components/chat-app";

interface ChatInterfaceProps {
  chat: Chat;
  currentUser: User;
}

export default function ChatInterface({
  chat,
  currentUser,
}: ChatInterfaceProps) {
  const { messages, sendMessage, isConnected } = useSocket(chat._id);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  console.log("messages", messages);
  // Get the other user in the chat
  const otherUser =
    chat.users.find((user) => user._id !== currentUser._id) || chat.users[0];
  console.log("otherUser", otherUser);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  // Group messages by date
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

  return (
    <Card className="flex flex-col h-full rounded-none border-0 bg-background">
      <CardHeader className="border-b px-4 bg-background">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage
                src={"/placeholder.svg?height=40&width=40"}
                alt={otherUser.username}
              />
              <AvatarFallback>
                {otherUser?.username.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <div className="font-medium">{otherUser.username}</div>
              <div className="text-xs text-muted-foreground">
                {isConnected ? "Online" : "Offline"}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 bg-background">
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
                      message.sender?.toString() === currentUser._id.toString()
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender.toString() === currentUser._id.toString()
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
      </CardContent>

      <CardFooter className="border-t p-3 bg-background">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full gap-2 items-center"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
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
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
