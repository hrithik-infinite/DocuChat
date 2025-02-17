import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import NavBar from "../components/NavBar";
import Providers from "../components/Providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en" className="light">
        <body className={cn("grainy min-h-screen font-sans antialiased", inter.className)}>
          <NavBar />
          <Toaster />
          {children}
        </body>
      </html>
    </Providers>
  );
}
