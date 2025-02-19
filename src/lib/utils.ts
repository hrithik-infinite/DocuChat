import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Metadata } from "next";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  console.log("VERCEL_PROJECT_PRODUCTION_URL ->", process.env.VERCEL_PROJECT_PRODUCTION_URL, "<-");
  if (!!process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function constructMetadata({
  title = "DocuChat - the SaaS for PDFs",
  description = "DocuChat is a software to make chatting to your PDF files easy.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
  baseUrl = "https://docuchat-hrithik.vercel.app/"
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  baseUrl?: string;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      type: "website",
      url: baseUrl
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@hrithikagarwal"
    },
    icons: { icon: icons },
    metadataBase: new URL(baseUrl),
    robots: noIndex
      ? {
          index: false,
          follow: false
        }
      : undefined
  };
}
