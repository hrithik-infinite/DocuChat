"use client";
import { forwardRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Loader2, FileText, FileSpreadsheet, Presentation, File } from "lucide-react";

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
].join(",");

interface UploadFormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}
export const UploadFormInput = forwardRef<HTMLFormElement, UploadFormInputProps>(({ onSubmit, isLoading }, ref) => {
  return (
    <form ref={ref} className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-end items-center gap-1">
          <Input
            id="file"
            name="file"
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            required
            disabled={isLoading}
            className={cn(isLoading && "opacity-50 cursor-not-allowed")}
          />
          <Button disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing ...
              </>
            ) : (
              "Upload Document"
            )}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> PDF
          </span>
          <span className="flex items-center gap-1">
            <File className="h-3 w-3" /> Word
          </span>
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="h-3 w-3" /> Excel
          </span>
          <span className="flex items-center gap-1">
            <Presentation className="h-3 w-3" /> PowerPoint
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> Text
          </span>
        </div>
      </div>
    </form>
  );
});
UploadFormInput.displayName = "UploadFormInput";
export default UploadFormInput;
