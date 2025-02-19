import { Inter } from "next/font/google";
import "./globals.css";
import { cn, constructMetadata } from "@/lib/utils";
import NavBar from "@/components/NavBar";
import { ClerkProvider } from "@clerk/nextjs";
import { ToasterProvider } from "../../provider/toast-provider";
import "simplebar-react/dist/simplebar.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn("grainy min-h-screen font-sans antialiased", inter.className)}>
          <ToasterProvider />
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
