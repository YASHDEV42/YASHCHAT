"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Bot } from "lucide-react";
import ChatInterface from "./chat-interface";
import AIChatInterface from "./ai-chat-interface";

export default function ChatTabs() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            User Chat
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <ChatInterface />
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <AIChatInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
}
