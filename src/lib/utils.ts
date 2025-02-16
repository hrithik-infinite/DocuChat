import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  console.log("VERCEL_PROJECT_PRODUCTION_URL ->", process.env.VERCEL_PROJECT_PRODUCTION_URL, "<-");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}
