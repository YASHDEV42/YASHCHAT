"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Shield, Zap } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Connect with friends in real-time
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                ChatConnect is a modern chat application that lets you
                communicate instantly with your friends and colleagues.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/signup">
                <Button size="lg" className="mt-4">
                  Get Started
                </Button>
              </Link>
              {isLoggedIn ? (
                <Link href="/chat">
                  <Button size="lg" variant="outline" className="mt-4">
                    Chat Now
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" variant="outline" className="mt-4">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-20 md:py-20 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-8 md:text-3xl">
            Key Features
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Real-time Messaging</h3>
              <p className="text-center text-muted-foreground">
                Send and receive messages instantly with our real-time chat
                system powered by Socket.io.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">User Authentication</h3>
              <p className="text-center text-muted-foreground">
                Secure user authentication with JWT ensures your conversations
                remain private.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Data Security</h3>
              <p className="text-center text-muted-foreground">
                Your messages are stored securely in MongoDB with proper
                encryption.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Fast & Responsive</h3>
              <p className="text-center text-muted-foreground">
                Built with Next.js for optimal performance across all devices.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
