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

export function absoluteUrl(path) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function constructMetadata() {
  const title = "DocuChat - the SaaS for PDFs";
  const description = "DocuChat is a software to make chatting to your PDF files easy.";
  const image = "/thumbnail.png";
  const icons = "/favicon.ico";
  const noIndex = false;
  const baseUrl = "https://docuchat-hrithik.vercel.app/";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      type: "website",
      url: baseUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@hrithikagarwal",
    },
    generic: {
      "og:title": title,
      "og:description": description,
      "og:image": image,
      "og:url": baseUrl,
      "og:type": "website",
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
      "twitter:creator": "@hrithikagarwal",
      "theme-color": "#FFF",
      icon: icons,
    },
    icons,
    metadataBase: new URL(baseUrl),
    "theme-color": "#FFF",
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
