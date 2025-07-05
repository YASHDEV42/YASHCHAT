"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MessageCircle, Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { getCurrentUser, logout } from "@/lib/auth";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const user = getCurrentUser(localStorage.getItem("token") || "");
    setIsLoggedIn(!!user);
    setIsLoading(false);
  }, []);

  // Check if the user is logged in every url change
  useEffect(() => {
    const user = getCurrentUser(localStorage.getItem("token") || "");
    setIsLoggedIn(!!user);
  }, [pathname]);
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold">
            YASHCHAT
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              size="sm"
              className="rounded-sm px-4"
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

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-6 px-2">
                {/* Navigation Links */}
                <nav className="flex flex-col gap-4">
                  <Link href="/" onClick={closeMobileMenu}>
                    <Button
                      variant={pathname === "/" ? "default" : "ghost"}
                      className="w-full justify-start rounded-none"
                    >
                      Home
                    </Button>
                  </Link>
                  {isLoggedIn && (
                    <Link href="/chat" onClick={closeMobileMenu}>
                      <Button
                        variant={pathname === "/chat" ? "default" : "ghost"}
                        className="w-full justify-start rounded-none"
                      >
                        Chat
                      </Button>
                    </Link>
                  )}
                </nav>

                {/* Auth Buttons */}
                <div className="flex flex-col gap-3 pt-6 border-t">
                  {isLoggedIn ? (
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full rounded-none"
                    >
                      Logout
                    </Button>
                  ) : (
                    <>
                      <Link href="/login" onClick={closeMobileMenu}>
                        <Button
                          variant="outline"
                          className="w-full rounded-none"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={closeMobileMenu}>
                        <Button className="w-full rounded-none">Sign Up</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
