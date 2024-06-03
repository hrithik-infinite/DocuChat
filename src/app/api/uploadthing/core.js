import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "@/lib/pinecone";
const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const data = await currentUser();
      const user = data.id;
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileKey = file.key;
      const keyFinal = fileKey.substring(0, fileKey.length - 4);
      const createdFile = await prismadb.file.create({
        data: {
          key: keyFinal,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: "PROCESSING",
        },
      });
      try {
        const resp = await fetch(file.url);
        const blob = await resp.blob();
        const loader = new PDFLoader(blob);

        const pageLevelDocs = await loader.load();
        const pagesAmt = pageLevelDocs.length;

        // const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index("docuchat");

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });

        await prismadb.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (e) {
        console.error(e);
        await prismadb.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
      }

      return { uploadedBy: metadata.userId };
    }),
};
