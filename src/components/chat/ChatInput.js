import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useContext, useRef } from "react";
import { ChatContext } from "./ChatContext";

const ChatInput = ({ isDisabled }) => {
  const { addMessage, handleInputChange, isLoading, message } = useContext(ChatContext);
  const textareaRef = useRef(null);
  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex w-full flex-grow flex-col p-4">
            <div className="relative">
              <Textarea
                autoFocus
                ref={textareaRef}
                onChange={handleInputChange}
                rows={1}
                maxRows={4}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();

                    addMessage();

                    textareaRef.current?.focus();
                  }
                }}
                placeholder="Enter your question..."
                className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch resize-none py-3 pr-12 text-base"
              />
              <Button
                disabled={isLoading || isDisabled}
                className="absolute bottom-1.5 right-[8px]"
                onClick={() => {
                  addMessage();

                  textareaRef.current?.focus();
                }}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
