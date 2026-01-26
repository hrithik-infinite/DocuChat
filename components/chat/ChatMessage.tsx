"use client";

import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-rose-50 dark:bg-rose-950/30" : "bg-gray-50 dark:bg-gray-900/50"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-rose-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {isUser ? "You" : "DocuChat AI"}
        </p>
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {content}
        </div>
      </div>
    </div>
  );
}
