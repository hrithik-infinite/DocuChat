import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ORIGIN_URL } from "@/utils/contants";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "DocuChat - AI-powered PDF Summarization",
  description: "Save hours of reading time. Transform lengthy PDFs into clear, accurate summaries in seconds with advanced AI technology. Secure, fast, and beautifully designed.",
  metadataBase: new URL(ORIGIN_URL),
  openGraph: {
    title: "DocuChat - AI-powered PDF Summarization",
    description: "Transform your PDFs into actionable summaries instantly. DocuChat uses AI to help you read less and understand more.",
    url: ORIGIN_URL,
    siteName: "DocuChat",
    images: [
      {
        url: "./opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "DocuChat - AI-powered PDF Summarization"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuChat - AI-powered PDF Summarization",
    description: "Transform your PDFs into actionable summaries instantly. DocuChat uses AI to help you read less and understand more.",
    images: ["./opengraph-image.png"]
  },
  alternates: {
    canonical: ORIGIN_URL
  },
  icons: {
    icon: "./icon.ico",
    shortcut: "./icon.ico",
    apple: "./icon.ico"
  },
  keywords: ["AI PDF Summarizer", "PDF Summary", "DocuChat", "AI Document Summarization", "PDF to Summary", "OpenAI", "GPT-4", "Langchain"],
  authors: [{ name: "Hrithik Agarwal", url: ORIGIN_URL }],
  creator: "Hrithik Agarwal"
};
export const viewport = {
  themeColor: "#f43f5e"
};
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`font-sans ${fontSans.variable}  antialiased`}>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
