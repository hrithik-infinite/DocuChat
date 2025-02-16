import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import { Inter } from "next/font/google";
import NavBar from "./components/NavBar";

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
    <html lang="en" className="light">
      <body className={cn("grainy min-h-screen font-sans antialiased", inter.className)}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
