import React, { createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INFINITE_QUERY_LIMIT } from "@/lib/utils";

const ChatContext = createContext({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

const ChatContextProvider = ({ fileId, children }) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const backupMessage = useRef("");

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      // Step 1
      await queryClient.cancelQueries("fileMessages");

      // Step 2
      const previousMessages = queryClient.getQueryData(["fileMessages", fileId]);

      // Step 3
      queryClient.setQueryData(["fileMessages", { fileId, limit: INFINITE_QUERY_LIMIT }], (old) => {
        if (!old) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const newPages = [...old.pages];

        const latestPage = newPages[0];

        latestPage.messages = [
          {
            createdAt: new Date().toISOString(),
            id: crypto.randomUUID(),
            text: message,
            isUserMessage: true,
          },
          ...latestPage.messages,
        ];

        newPages[0] = latestPage;

        return {
          ...old,
          pages: newPages,
        };
      });

      setIsLoading(true);

      return {
        previousMessages: previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Accumulated response
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        // Append chunk to the actual message
        queryClient.setQueryData(["fileMessages", { fileId, limit: INFINITE_QUERY_LIMIT }], (old) => {
          if (!old) return { pages: [], pageParams: [] };

          let isAiResponseCreated = old.pages.some((page) => page.messages.some((message) => message.id === "ai-response"));

          const updatedPages = old.pages.map((page) => {
            if (page === old.pages[0]) {
              let updatedMessages;

              if (!isAiResponseCreated) {
                updatedMessages = [
                  {
                    createdAt: new Date().toISOString(),
                    id: "ai-response",
                    text: accResponse,
                    isUserMessage: false,
                  },
                  ...page.messages,
                ];
              } else {
                updatedMessages = page.messages.map((message) => {
                  if (message.id === "ai-response") {
                    return {
                      ...message,
                      text: accResponse,
                    };
                  }
                  return message;
                });
              }

              return {
                ...page,
                messages: updatedMessages,
              };
            }

            return page;
          });

          return { ...old, pages: updatedPages };
        });
      }
    },

    onError: (error, variables, context) => {
      setMessage(backupMessage.current);
      queryClient.setQueryData(["fileMessages", fileId], {
        messages: context?.previousMessages ?? [],
      });
    },
    onSettled: async () => {
      setIsLoading(false);
      await queryClient.invalidateQueries(["fileMessages", fileId]);
    },
  });

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = () => sendMessageMutation.mutate({ message });

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatContextProvider };
