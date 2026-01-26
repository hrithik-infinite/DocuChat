"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chat/ChatInterface";
import { MessageSquare, X, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  summaryId: string;
  documentTitle?: string;
}

export default function ChatPanel({ summaryId, documentTitle }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Chat with Document</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-white dark:bg-gray-950 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300",
            isExpanded
              ? "inset-4 sm:inset-8"
              : "bottom-6 right-6 w-[95vw] sm:w-[450px] h-[70vh] max-h-[600px]"
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Chat
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface summaryId={summaryId} documentTitle={documentTitle} />
          </div>
        </div>
      )}
    </>
  );
}
