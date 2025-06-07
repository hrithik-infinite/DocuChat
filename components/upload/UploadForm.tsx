"use client";
import UploadFormInput from "./UploadFormInput";

import { z } from "zod";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Please upload a file." })
    .refine((file) => file.size <= 5 * 1024 * 1024, { message: "File size must be less than 5 MB." })
    .refine((file) => file.type === "application/pdf", { message: "File must be a PDF." })
});
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const file = formData.get("file") as File;
  const validatedFields = schema.safeParse({ file });
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors.file?.[0] ?? "Invalif File");
    return;
  }
  console.log("submitted");
};
export default function UploadForm() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
}
