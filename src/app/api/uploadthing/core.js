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
      console.log("STEP1__________________");
      const createdFile = await prismadb.file.create({
        data: {
          key: keyFinal,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: "PROCESSING",
        },
      });
      console.log("STEP2__________________");
      try {
        console.log("STEP3__________________");
        const resp = await fetch(file.url);
        const blob = await resp.blob();
        console.log("STEP4__________________");

        const loader = new PDFLoader(blob);
        console.log("STEP5__________________");

        const pageLevelDocs = await loader.load();
        // console.log("pageLevelDocs+++++++++++++++++", pageLevelDocs);
        const pagesAmt = pageLevelDocs.length;
        console.log("STEP6__________________");

        // const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index("docuchat");
        console.log("STEP7__________________");

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
        console.log("STEP8__________________");

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });
        console.log("STEP9__________________");

        await prismadb.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (e) {
        console.log("STEP10 catch__________________");

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
