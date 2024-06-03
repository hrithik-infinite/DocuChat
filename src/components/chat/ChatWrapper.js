"use client";
import { useState, useEffect } from "react";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import axios from "axios";
import { buttonVariants } from "../ui/button";
import Link from "next/link";
import { ChatContextProvider } from "./ChatContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const ChatWrapper = ({ fileId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("PROCESSING");
  const queryClient = new QueryClient();

  useEffect(() => {
    const startPolling = () => {
      let polling;
      const fetchFile = async () => {
        try {
          const file = await axios.get(`/api/getFileUploadStatus?id=${fileId}`);
          setUploadStatus(file?.data?.uploadStatus);
          if (file?.data?.uploadStatus === "SUCCESS" || file?.data?.uploadStatus === "FAILED") {
            setIsLoading(false);
            clearInterval(polling);
          }
        } catch (error) {
          console.log(error);
        }
      };

      polling = setInterval(fetchFile, 500);
      fetchFile();

      return () => {
        clearInterval(polling);
      };
    };

    startPolling();
  }, [fileId]);

  if (isLoading) {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Loading...</h3>
            <p className="text-sm text-zinc-500">We&apos;re preparing your PDF.</p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );
  }

  if (uploadStatus === "PROCESSING") {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Processing PDF...</h3>
            <p className="text-sm text-zinc-500">This won&apos;t take long.</p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );
  }
  if (uploadStatus === "FAILED") {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="text-xl font-semibold">Too many pages in PDF</h3>
            <p className="text-sm text-zinc-500">
              Your <span className="font-medium">{false ? "Pro" : "Free"}</span> plan supports up to 5 pages per PDF.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}>
              <ChevronLeft className="mr-1.5 h-3 w-3" />
              Back
            </Link>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <ChatContextProvider fileId={fileId}>
        <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
          <div className="mb-28 flex flex-1 flex-col justify-between">
            <Messages />
          </div>
          <ChatInput />
        </div>
      </ChatContextProvider>
    </QueryClientProvider>
  );
};

export default ChatWrapper;
