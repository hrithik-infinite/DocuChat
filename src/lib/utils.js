import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const INFINITE_QUERY_LIMIT = 10;
export const loadingMessage = {
  createdAt: new Date().toISOString(),
  id: "loading-message",
  isUserMessage: false,
  text: (
    <span className="flex h-full items-center justify-center">
      <Loader2 className="h-4 w-4 animate-spin" />
    </span>
  ),
};
