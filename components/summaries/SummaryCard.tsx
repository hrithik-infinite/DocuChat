import Link from "next/link";
import { Card } from "../ui/card";
import DeleteButton from "./DeleteButton";

export default function SummaryCard({ summary }: { summary: any }) {
  return (
    <div>
      <Card className="relative h-full">
        <div className="absolute top-2 right-2">
          <DeleteButton />
        </div>
        <Link href={`summaries/${summary?.id}`} className="block p-4 sm:p-6">
          <h3 className="text-base xl:text-lg font-semibold text-gray-900 truncate w-4/5">{summary?.title}</h3>
          <p className="text-gray-600 lime-clamp-2 text-sm sm:text-base pl-2">{summary?.summary_text}</p>
          <p className="text-sm text-gray-500">2024</p>
          <div>
            <span></span>
          </div>
        </Link>
      </Card>
    </div>
  );
}
