"use client";
import { useContext, useRef } from "react";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_QUERY_LIMIT, loadingMessage } from "@/lib/utils";
import Skeleton from "react-loading-skeleton";
import { MessageSquare } from "lucide-react";
import Message from "./Message";
import { ChatContext } from "./ChatContext";
import { useIntersection } from "@mantine/hooks";
const Messages = ({ fileId }) => {
  const fetchmsg = async ({ pageParam = null, fileId, limit }) => {
    const resp = await axios.post("/api/getFileMessages", { fileId, cursor: pageParam, limit });
    return resp.data;
  };

  const useInfiniteFileMessages = (fileId) => {
    return useInfiniteQuery({
      queryKey: ["fileMessages", fileId],
      queryFn: ({ pageParam = null }) => fetchmsg({ pageParam, fileId, limit: INFINITE_QUERY_LIMIT }),
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      keepPreviousData: true,
    });
  };
  const { isLoading: isAiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } = useInfiniteFileMessages(fileId);
  const messages = data?.pages.flatMap((page) => page.messages);
  const combinedMessages = [...(isAiThinking ? [loadingMessage] : []), ...(messages ?? [])];
  const lastMessageRef = useRef(null);
  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSamePerson = combinedMessages[i - 1]?.isUserMessage === combinedMessages[i]?.isUserMessage;
          if (i === combinedMessages.length - 1) {
            return <Message ref={lastMessageRef} message={message} isNextMessageSamePerson={isNextMessageSamePerson} key={message.id} />;
          } else return <Message message={message} isNextMessageSamePerson={isNextMessageSamePerson} key={message.id} />;
        })
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">Ask your first question to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Messages;
