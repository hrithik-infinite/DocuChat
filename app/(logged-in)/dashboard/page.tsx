import BgGradient from "@/components/common/bg-gradient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <BgGradient />
      <div className="container mx-auto flex flex-col gap-4">
        <h1>You Summaries</h1>
        <p>Transform your PDF&apos;s into concise, actionable insights</p>
        <div>
          <Button variant={"link"}>
            <Link href="/upload" className="flex text-white items-center">
              <Plus className="w-5 h-5 mr-2" />New Summary
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
