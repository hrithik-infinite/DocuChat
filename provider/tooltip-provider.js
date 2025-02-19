"use client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const TProvider = ({ children, ...props }) => {
  return <TooltipProvider {...props}>{children}</TooltipProvider>;
};

export const Ttip = ({ children, ...props }) => {
  return <Tooltip {...props}>{children}</Tooltip>;
};
export const TtipContent = ({ children, ...props }) => {
  return <TooltipContent {...props}>{children}</TooltipContent>;
};
export const TtipTrigger = ({ children, ...props }) => {
  return <TooltipTrigger {...props}>{children}</TooltipTrigger>;
};
