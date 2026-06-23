"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, Sparkles, User, Scissors, Shirt, ArrowRight } from "lucide-react";
import { chatApi } from "@/services/api";
import MessageBubble, { Message } from "@/components/chat/MessageBubble";
import ChatProductCard from "@/components/chat/ChatProductCard";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m0",
    sender: "support",
    type: "text",
    content: "Welcome to Lumière AI Concierge. I am your personal stylist, here to curate the perfect wardrobe for your aesthetic. What are we looking for today?",
  }
];

export default function StylistPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => "web_" + Math.random().toString(36).substring(7));

  useEffect(() => {
    // Start with initial message
    setMessages(INITIAL_MESSAGES);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      type: "text",
      content: query,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages
        .filter(m => m.type === "text")
        .map(m => ({
          role: m.sender === "user" ? "user" : "ai",
          text: m.content
        }))
        .slice(-6);

      const res = await chatApi.sendMessage({
        message: query,
        session_id: sessionId,
        history
      });

      setIsTyping(false);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "support",
        type: "text",
        content: res.message
      };
      
      setMessages(prev => [...prev, aiResponse]);

      if (res.products && res.products.length > 0) {
        setTimeout(() => {
          const productMessages: Message[] = res.products.map((p: any, i: number) => ({
            id: (Date.now() + 10 + i).toString(),
            sender: "support",
            type: "product" as const,
            content: "product",
            product: p
          }));
          setMessages(prev => [...prev, ...productMessages]);
        }, 600);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now().toString(), 
          sender: "support", 
          type: "text", 
          content: "My apologies, the atelier's digital connection is currently interrupted. Please try again in a moment." 
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      {/* Editorial Header */}
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-8 text-center border-b border-gray-50">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-full bg-black flex items-center justify-center text-white ring-8 ring-gray-50 shadow-xl">
             <Sparkles className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-black mb-4 uppercase">
          Digital Concierge
        </h1>
        <p className="max-w-xl mx-auto text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
          Intelligent Curation & Style Advisory
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-0">
        <div className="relative flex flex-col h-[70vh] bg-white">
          
          {/* Chat Interface */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto px-4 md:px-12 py-12 space-y-8 scroll-smooth scrollbar-thin scrollbar-thumb-gray-100"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] ${msg.sender === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                  {msg.sender === "support" && msg.type === "text" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-5 w-5 bg-black rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-white font-serif">L</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Concierge</span>
                    </div>
                  )}
                  
                  {msg.type === "text" ? (
                    <div className={`
                      px-6 py-4 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${msg.sender === "user" 
                        ? "bg-black text-white rounded-br-none" 
                        : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-none"}
                    `}>
                      {msg.content}
                    </div>
                  ) : msg.product ? (
                    <div className="w-full mt-2 transform transition-all hover:scale-[1.02]">
                       <ChatProductCard product={msg.product} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex gap-2 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-black/20 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-black/20 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-black/20 animate-bounce"></div>
                </div>
              </div>
            )}
          </div>

          {/* Luxury Input Tray */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl pt-6 pb-12 px-4 md:px-12 border-t border-gray-50">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSend} className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe an occasion, a mood, or a specific piece..."
                  className="w-full h-16 rounded-full border-2 border-gray-100 bg-gray-50/50 px-8 pr-20 text-sm focus:border-black focus:bg-white focus:outline-none transition-all shadow-sm group-hover:bg-gray-50"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-3 top-3 h-10 w-10 rounded-full bg-black text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-20 shadow-lg shadow-black/10"
                >
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
              
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {["Curate a Look", "Size Guide", "New Arrivals", "Sustainable Pieces"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setInput(tag); }}
                    className="px-4 py-2 rounded-full border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:border-black hover:text-black hover:bg-black/5 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
