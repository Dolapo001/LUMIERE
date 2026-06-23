import React from "react";
import ReactMarkdown from "react-markdown";
import { Product } from "@/types";

export interface Message {
  id: string;
  sender: "user" | "support";
  type: "text" | "product";
  content: string;
  product?: Product;
  suggestions?: string[];
}

interface MessageBubbleProps {
  message: Message;
  children?: React.ReactNode;
}

export default function MessageBubble({ message, children }: MessageBubbleProps) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {message.type === "product" && children ? (
        children
      ) : (
        <div
          className={`px-3 py-2 text-xs leading-relaxed max-w-[85%] rounded-md shadow-sm ${
            isUser
              ? "bg-black text-white rounded-br-sm"
              : "border border-gray-200 bg-gray-50 text-black rounded-bl-sm"
          }`}
        >
          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
