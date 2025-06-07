"use client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
interface UploadFormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
export default function UploadFormInput({ onSubmit }: UploadFormInputProps) {
  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex justify-end items-center gap-1">
        <Input id="file" name="file" type="file" accept="application/pdf" required />
        <Button>Upload your PDF</Button>
      </div>
    </form>
  );
}
