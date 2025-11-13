import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Zap, Send, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: Date;
}

export default function Chat() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  
  // Mock data - replace with Firebase Firestore
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "them",
      text: "Hi! Thanks for connecting. I'm excited to work with you!",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      sender: "me",
      text: "Great! Can you start this week?",
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: "3",
      sender: "them",
      text: "Yes, absolutely! I'm available to start Monday. What tasks would you like me to focus on first?",
      timestamp: new Date(Date.now() - 1800000),
    },
  ]);

  const contact = {
    name: "Maria Santos",
    role: "E-commerce Specialist",
    avatar: "MS",
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: String(Date.now()),
      sender: "me",
      text: message,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    
    // TODO: Send to Firebase
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#FFD600]" fill="#FFD600" />
                </div>
                <span className="text-xl text-black tracking-tight">Blytz Hire</span>
              </Link>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FFB800] flex items-center justify-center text-black">
                  {contact.avatar}
                </div>
                <div>
                  <h2 className="text-black">{contact.name}</h2>
                  <p className="text-sm text-gray-600">{contact.role}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-black text-black" asChild>
              <Link to="/employer/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 container mx-auto px-6 max-w-4xl py-8">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md px-6 py-4 rounded-2xl ${
                  msg.sender === "me"
                    ? "bg-black text-white"
                    : "bg-white border-2 border-gray-200 text-black"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <p
                  className={`text-sm mt-2 ${
                    msg.sender === "me" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-6 max-w-4xl">
          <form onSubmit={handleSend} className="flex gap-3">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
            />
            <Button
              type="submit"
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black px-8"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
