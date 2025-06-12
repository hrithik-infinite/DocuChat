import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";

export default function DeleteButton() {
  return (
    <Button variant={"ghost"} size="icon" className="text-gray-400 bg-gray-50 border border-gray-200 hover:text-rose-600 hover:bg-rose-50">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
