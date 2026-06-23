"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { chatApi } from "@/services/api";
import MessageBubble, { Message } from "./MessageBubble";
import ChatProductCard from "./ChatProductCard";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "support",
    type: "text",
    content: "Hi there! Welcome to Lumière support. How can we help you today?",
  }
];

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useAppContext();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState(() => Math.random().toString(36).substring(7));

  // Unified History Hydration (Server -> Local)
  useEffect(() => {
    async function hydrateHistory() {
      const token = localStorage.getItem("lumiere_token");
      
      // 1. Try server-side history first if authenticated
      if (token) {
        try {
          const { history, session_id } = await chatApi.getHistory();
          if (history && history.length > 0) {
            setMessages(history);
            if (session_id) setSessionId(session_id);
            return; // Success!
          }
        } catch (e) {
          console.warn("Server history fetch failed, falling back to local memory", e);
        }
      }

      // 2. Fallback to LocalStorage (Guests or if server fetch failed)
      const saved = localStorage.getItem("lumiere_chat_memory");
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          setMessages(INITIAL_MESSAGES);
        }
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    }

    hydrateHistory();
  }, []);

  // Sync Memory
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("lumiere_chat_memory", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || isTyping) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      type: "text",
      content: query,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Prepare history for LLM context
      const history = messages
        .filter(m => m.type === "text")
        .map(m => ({
          role: m.sender === "user" ? "user" : "ai",
          text: m.content
        }))
        .slice(-5);

      const stream = await chatApi.streamMessage({
        message: query,
        session_id: sessionId,
        history
      });
      
      if (!stream) throw new Error("Connection failed or rate limit reached.");

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      
      const aiMessageId = crypto.randomUUID();
      // Add initial empty AI message
      setMessages(prev => [...prev, {
        id: aiMessageId,
        sender: "support",
        type: "text",
        content: ""
      }]);

      let accumulatedText = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        
        // Extract and handle product cards, auto-actions, and suggestions
        while (true) {
            const productMatch = accumulatedText.match(/\|PRODUCT_JSON\|([\s\S]*?)\|END_PRODUCT\|/);
            const autoAddMatch = accumulatedText.match(/\|AUTO_ADD_CART\|([\s\S]*?)\|END_AUTO_ADD_CART\|/);
            const suggestionsMatch = accumulatedText.match(/\|SUGGESTIONS\|([\s\S]*?)\|END_SUGGESTIONS\|/);
            
            if (productMatch) {
                const fullMatch = productMatch[0];
                const jsonString = productMatch[1];
                try {
                    const productData = JSON.parse(jsonString);
                    accumulatedText = accumulatedText.replace(fullMatch, "");
                    setMessages(prev => [...prev, {
                        id: crypto.randomUUID(),
                        sender: "support",
                        type: "product",
                        content: "",
                        product: productData
                    }]);
                } catch (e) { break; }
                continue;
            }

            if (autoAddMatch) {
                const fullMatch = autoAddMatch[0];
                const jsonString = autoAddMatch[1];
                try {
                    const productData = JSON.parse(jsonString);
                    accumulatedText = accumulatedText.replace(fullMatch, "");
                    addToCart({ ...productData, quantity: 1 } as any);
                    toast(`${productData.name} added to bag!`, "success");
                } catch (e) { break; }
                continue;
            }

            if (suggestionsMatch) {
                const fullMatch = suggestionsMatch[0];
                const jsonString = suggestionsMatch[1];
                try {
                    const suggestedReplies = JSON.parse(jsonString);
                    accumulatedText = accumulatedText.replace(fullMatch, "");
                    // Attach suggestions to the specific AI message
                    setMessages(prev => prev.map(m => 
                        m.id === aiMessageId ? { ...m, suggestions: suggestedReplies } : m
                    ));
                } catch (e) { break; }
                continue;
            }

            break; 
        }
        
        // Update the main AI message text content
        setMessages(prev => prev.map(m => 
          m.id === aiMessageId ? { ...m, content: accumulatedText } : m
        ));
      }

    } catch (err: any) {
      console.error("Chat error:", err);
      const isQuota = err.message?.includes("429") || err.message?.includes("quota");
      
      setMessages(prev => [
        ...prev,
        { 
          id: crypto.randomUUID(), 
          sender: "support", 
          type: "text", 
          content: isQuota 
            ? "I've reached my daily limit of fashion wisdom. While I can't browse the shelves right now, I can still help with logistics, shipping, or tracking! 🕊️"
            : "Style Interrupted: I'm having a bit of trouble connecting to my stylist network right now. Please try again in a moment, or ask about our return policy! ✨",
          suggestions: ["Track my order", "What is the return policy?", "Show trending pieces"]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (pathname === "/chat") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-4 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                <span className="text-xs font-bold font-serif">L</span>
                <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-black leading-tight">Lumière Assistant</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Stylist Online</p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-black focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#fafafa] p-4 scroll-smooth">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2">
                  <MessageBubble message={msg}>
                    {msg.type === "product" && msg.product && (
                      <ChatProductCard product={msg.product} />
                    )}
                  </MessageBubble>
                </div>
              ))}
              {/* Suggestions */}
              {messages.length > 0 && messages[messages.length-1].sender === "support" && messages[messages.length-1].suggestions && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {messages[messages.length-1].suggestions?.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        // Trigger send automatically for better UX
                        setTimeout(() => handleSend(), 0);
                      }}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 transition-colors hover:border-black hover:text-black hover:bg-gray-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {isTyping && (
                <div className="flex w-full justify-start items-center gap-2">
                  <div className="flex gap-1 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="shrink-0 border-t border-gray-100 bg-white p-4">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about pieces, styles, or sizing..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-5 pr-12 text-sm text-black placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none transition-all shadow-inner"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-opacity disabled:opacity-30 hover:opacity-90 active:scale-95"
              >
                {isTyping ? <Loader2 className="h-3 w-3 animate-spin"/> : <Send className="h-3 w-3 ml-0.5" />}
              </button>
            </form>
          </div>
          
        </div>
      )}

      {/* Floating Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 ${
          open ? 'bg-gray-900 rotate-90' : 'bg-black'
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 fill-current" />}
      </button>

    </div>
  );
}
