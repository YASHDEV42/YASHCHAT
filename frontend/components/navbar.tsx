"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { getCurrentUser, logout } from "@/lib/auth";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    const user = getCurrentUser(localStorage.getItem("token") || "");
    setIsLoggedIn(!!user);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold">
            ChatConnect
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              size="sm"
              className=" rounded-sm px-4"
            >
              Home
            </Button>
          </Link>
          {isLoggedIn && (
            <Link href="/chat">
              <Button
                variant={pathname === "/chat" ? "default" : "ghost"}
                size="sm"
                className="rounded-sm px-4"
              >
                Chat
              </Button>
            </Link>
          )}
          <ModeToggle />
          {isLoggedIn ? (
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
