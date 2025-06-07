"use client";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./UploadFormInput";

import { z } from "zod";

export default function UploadForm() {
  const schema = z.object({
    file: z
      .instanceof(File, { message: "Please upload a file." })
      .refine((file) => file.size <= 5 * 1024 * 1024, { message: "File size must be less than 5 MB." })
      .refine((file) => file.type === "application/pdf", { message: "File must be a PDF." })
  });

  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("Uploaded successfully");
    },
    onUploadError: (e) => {
      console.error(e);
    },
    onUploadBegin: () => {}
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const validatedFields = schema.safeParse({ file });
    if (!validatedFields.success) {
      console.log(validatedFields.error.flatten().fieldErrors.file?.[0] ?? "Invalif File");
      return;
    }
    const resp = await startUpload([file]);
    console.log("submitted", resp);
    if (!resp) return;
  };
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
}
