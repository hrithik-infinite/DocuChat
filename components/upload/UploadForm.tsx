"use client";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./UploadFormInput";
import { toast } from "sonner";
import { z } from "zod";
import { generatePdfSummary, storePdfSummaryAction } from "@/actions/upload-actions";
import { useRef, useState } from "react";

export default function UploadForm() {
  const schema = z.object({
    file: z
      .instanceof(File, { message: "Please upload a file." })
      .refine((file) => file.size <= 5 * 1024 * 1024, { message: "File size must be less than 5 MB." })
      .refine((file) => file.type === "application/pdf", { message: "File must be a PDF." })
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("Uploaded successfully");
    },
    onUploadError: (e) => {
      toast.error("Error occurred while uploading", {
        description: e.message
      });
      console.error(e);
    },
    onUploadBegin: () => {}
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.currentTarget);
      const file = formData.get("file") as File;
      const validatedFields = schema.safeParse({ file });
      if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors.file?.[0] ?? "Invalid File");
        toast.error("Something went wrong", {
          description: validatedFields.error.flatten().fieldErrors.file?.[0] ?? "Invalid File"
        });
        setIsLoading(false);
        return;
      }
      toast.info("Uploading PDF", {
        description: "We are uploading your PDF"
      });
      const resp = await startUpload([file]);
      console.log("submitted", resp);
      if (!resp) {
        toast.error("Somethign went wrong!", {
          description: " Please use a different file"
        });
        setIsLoading(false);

        return;
      }
      toast.info("Processing PDF", {
        description: "Hang tight! Our AI is reading through your document."
      });

      const result = await generatePdfSummary(resp);
      const { data = null, message = null } = result || {};
      if (data) {
        let storeResult;
        toast.success("Saving PDF", {
          description: "Hang tight! We are saving your summary!."
        });
        if (data.summary) {
          storeResult = await storePdfSummaryAction({
            fileUrl: resp[0].serverData.file.url,
            summary: data.summary,
            title: data.title,
            fileName: file.name
          });
          toast.success("Summary generated", {
            description: "Your PDF has been successfullt summarized and saved"
          });
        }
        formRef.current?.reset();
      }
    } catch (e) {
      setIsLoading(false);

      console.error(e);
      formRef.current?.reset();
    }
  };
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput isLoading={isLoading} ref={formRef} onSubmit={handleSubmit} />
    </div>
  );
}
