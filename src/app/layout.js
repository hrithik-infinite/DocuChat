import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavBar from "@/components/NavBar";
import { ClerkProvider} from "@clerk/nextjs";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DocuChat",
  description: "Chat with your Documents",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn("min-h-screen font-sans antialiased grainy", inter.className)}>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
