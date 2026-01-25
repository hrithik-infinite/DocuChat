"use client";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./UploadFormInput";
import TemplateSelector from "./TemplateSelector";
import { toast } from "sonner";
import { z } from "zod";
import { generatePdfSummary, generateDocumentText, storePdfSummaryAction } from "@/actions/upload-actions";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSkeleton from "./LoadingSkeleton";
import { formatFileName } from "@/lib/utils";
import { SummaryTemplate, DEFAULT_TEMPLATE } from "@/types/templates";

const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
] as const;

export default function UploadForm() {
  const schema = z.object({
    file: z
      .instanceof(File, { message: "Please upload a file." })
      .refine((file) => file.size <= 5 * 1024 * 1024, { message: "File size must be less than 5 MB." })
      .refine(
        (file) => SUPPORTED_MIME_TYPES.includes(file.type as typeof SUPPORTED_MIME_TYPES[number]),
        { message: "Unsupported file type. Please upload PDF, Word, Excel, PowerPoint, or text files." }
      )
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SummaryTemplate>(DEFAULT_TEMPLATE);
  const router = useRouter();
  const { startUpload } = useUploadThing("documentUploader", {
    onClientUploadComplete: () => {
      console.log("Uploaded successfully");
    },
    onUploadError: (e) => {
      toast.error("Error occurred while uploading", {
        description: e.message
      });
      console.error(e);
    },
    onUploadBegin: (data) => {
      console.log(data);
    }
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
      toast.info("Uploading document", {
        description: "We are uploading your document"
      });
      const uploadResp = await startUpload([file]);
      console.log("submitted", uploadResp);
      if (!uploadResp) {
        toast.error("Something went wrong!", {
          description: "Please use a different file"
        });
        setIsLoading(false);

        return;
      }

      const uploadFileUrl = uploadResp[0].serverData?.url || uploadResp[0].ufsUrl;
      const uploadFileType = uploadResp[0].serverData?.type || uploadResp[0].type || file.type;
      const formattedFileName = formatFileName(file.name);
      let storeResult;

      toast.info("Extracting text", {
        description: "Reading your document content..."
      });

      const result = await generateDocumentText({
        fileUrl: uploadFileUrl,
        fileName: file.name,
        fileType: uploadFileType
      });

      if (!result.success || !result.data?.documentText) {
        toast.error("Failed to extract text", {
          description: result.message || "Could not read the document"
        });
        setIsLoading(false);
        return;
      }

      toast.info("Generating summary", {
        description: "Hang tight! Our AI is reading through your document."
      });

      const summaryResult = await generatePdfSummary({
        pdfText: result.data.documentText,
        template: selectedTemplate
      });

      toast.info("Saving summary", {
        description: "Almost done!"
      });

      const { data = null } = summaryResult || {};

      if (data?.summary) {
        storeResult = await storePdfSummaryAction({
          fileUrl: uploadFileUrl,
          summary: data.summary,
          title: formattedFileName,
          fileName: file.name
        });
        toast.success("Summary generated", {
          description: "Your document has been successfully summarized and saved"
        });
      }
      formRef.current?.reset();
      router.push(`/summaries/${storeResult?.data?.id}`);
    } catch (e) {
      setIsLoading(false);

      console.error(e);
      formRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <TemplateSelector
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        disabled={isLoading}
      />
      <UploadFormInput isLoading={isLoading} ref={formRef} onSubmit={handleSubmit} />
      {isLoading && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-muted-foreground text-sm">Processing</span>
            </div>
          </div>
          <LoadingSkeleton />
        </>
      )}
    </div>
  );
}
