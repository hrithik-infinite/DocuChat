import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-gray-500 text-base">
        <div className="flex items-center gap-4 justify-center">
          <Image src="/hrithik-avatar.jpg" alt="Hrithik Agarwal" width={96} height={96} className="rounded-full border-2 border-rose-200 shadow-md" />
          <span className="text-lg">
            Made with <span className="text-rose-500 text-xl">♥</span> by{" "}
            <Link href="https://github.com/hrithik-infinite" target="_blank" rel="noopener noreferrer" className="font-semibold text-rose-500 hover:underline">
              Hrithik Agarwal
            </Link>
          </span>
        </div>
        <div className="flex flex-wrap gap-6 justify-center text-base items-center">
          <a href="https://github.com/hrithik-infinite/DocuChat" target="_blank" rel="noopener noreferrer" className="hover:text-rose-500 transition-colors flex items-center gap-1">
            <Github className="inline-block w-5 h-5" /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/hrithikagarwal/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-500 transition-colors flex items-center gap-1">
            <Linkedin className="inline-block w-5 h-5" /> LinkedIn
          </a>
        </div>
      </div>
      <div className="mt-6 text-center text-sm text-gray-400">© {new Date().getFullYear()} DocuChat. All rights reserved.</div>
    </footer>
  );
}
