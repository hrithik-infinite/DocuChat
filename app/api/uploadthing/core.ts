import { UploadThingError } from "uploadthing/server";
import { type FileRouter, createUploadthing } from "uploadthing/next";
import { withAuth } from "@workos-inc/authkit-nextjs";

const f = createUploadthing();
export const ourFileRouter = {
  // Keep legacy PDF uploader for backwards compatibility
  pdfUploader: f({
    pdf: { maxFileSize: "4MB" }
  })
    .middleware(async () => {
      const { user } = await withAuth();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("upload completed for user id");
      return {
        userId: metadata.userId,
        name: file.name,
        url: file.ufsUrl
      };
    }),

  // New multi-format document uploader
  documentUploader: f({
    pdf: { maxFileSize: "4MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "4MB" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "4MB" },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "4MB" },
    "text/plain": { maxFileSize: "1MB" },
    "text/markdown": { maxFileSize: "1MB" },
  })
    .middleware(async () => {
      const { user } = await withAuth();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log("document upload completed for user id:", metadata.userId);
      return {
        url: file.ufsUrl,
        name: file.name,
        type: file.type
      };
    })
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;
