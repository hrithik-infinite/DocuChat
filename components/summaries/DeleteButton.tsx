"use client";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { deleteSummaryAction } from "@/actions/summary-actions";
import { toast } from "sonner";

interface DeleteBtnProps {
  summaryId: string;
}
export default function DeleteButton({ summaryId }: DeleteBtnProps) {
  const [open, setOpen] = useState(false);
  const handleDelete = async () => {
    const result = await deleteSummaryAction({ summaryId });
    if (!result.success) {
      toast.error("Error", {
        description: "Failed to delete summary"
      });
    }
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size="icon" className="text-gray-400 bg-gray-50 border border-gray-200 hover:text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete Summary</DialogTitle>
          <DialogDescription>Are you sure you ant to delete this summary. This action cannot be undone</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={"ghost"} className="bg-gray-50 border border-gray-200 hover:text-gray-600 hover:bg-gray-100" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant={"destructive"} className=" bg-gray-900 hover:bg-gray-600" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
