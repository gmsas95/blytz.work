"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Phone, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  
  // Mock data - replace with Firebase Firestore
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "them",
      text: "Hi! I'm excited to work with you on your e-commerce store. I've reviewed the contract and I'm ready to get started.",
      timestamp: new Date("2024-01-15T09:00:00"),
    },
    {
      id: "2",
      sender: "me",
      text: "Great to have you on board! Let's start with the store setup. I'll share the login credentials shortly.",
      timestamp: new Date("2024-01-15T09:15:00"),
    },
    {
      id: "3",
      sender: "them",
      text: "Perfect! I have experience with Shopify, so this should be straightforward. Do you have any specific preferences for the store design?",
      timestamp: new Date("2024-01-15T09:30:00"),
    },
  ]);

  // Mock VA profile
  const vaProfile = {
    id: "123",
    name: "Maria Santos",
    role: "E-commerce Specialist",
    rating: 4.9,
    avatar: "/placeholder-avatar.jpg",
    status: "online",
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "me",
        text: message,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-4 h-[calc(100vh-80px)]">
        <div className="container mx-auto px-6 max-w-6xl h-full">
          <div className="bg-white rounded-xl border-2 border-gray-200 h-full flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/employer/dashboard">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {vaProfile.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        vaProfile.status === "online" ? "bg-green-500" : "bg-gray-400"
                      }`} />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-black">{vaProfile.name}</h3>
                      <p className="text-sm text-gray-600">{vaProfile.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800" variant="secondary">
                    {vaProfile.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-xl ${
                      msg.sender === "me"
                        ? "bg-[#FFD600] text-black"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === "me" ? "text-gray-700" : "text-gray-500"
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD600] focus:border-transparent"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}