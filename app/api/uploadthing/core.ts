import { UploadThingError } from "uploadthing/server";
import { type FileRouter, createUploadthing } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs/server";

const f = createUploadthing();
export const ourFileRouter = {
  pdfUploader: f({
    pdf: { maxFileSize: "4MB" }
  })
    .middleware(async () => {
      const user = await currentUser();
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
    })
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;
