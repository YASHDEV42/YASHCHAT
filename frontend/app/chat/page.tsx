"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/chat-interface";
import { isAuthenticated } from "@/lib/auth";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="container py-6">
      <ChatInterface />
    </div>
  );
}
