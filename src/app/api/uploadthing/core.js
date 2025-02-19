import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/lib/stripePlans";

const f = createUploadthing();

const middleware = async () => {
  const data = await currentUser();
  if (!data || !data.id) throw new UploadThingError("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();
  return { userId: data.id, subscriptionPlan };
};

const onUploadComplete = async ({ metadata, file }) => {
  const fileKey = file.key;
  const keyFinal = fileKey.substring(0, fileKey.length - 4);
  const existingFile = await prismadb.file.findFirst({
    where: { key: keyFinal },
  });

  if (existingFile) return;

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
    const response = await fetch(file.url);
    const blob = await response.blob();
    const loader = new PDFLoader(blob);
    const pageLevelDocs = await loader.load();
    const pagesAmt = pageLevelDocs.length;
    const { subscriptionPlan } = metadata;
    const isSubscribed = subscriptionPlan.isSubscribed;
    const proPlan = PLANS.find((plan) => plan.name === "Pro");
    const freePlan = PLANS.find((plan) => plan.name === "Free");

    const isProExceeded = pagesAmt > (proPlan ? proPlan.pagesPerPdf : 0);
    const isFreeExceeded = pagesAmt > (freePlan ? freePlan.pagesPerPdf : 0);

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await prismadb.file.update({
        data: { uploadStatus: "FAILED" },
        where: { id: createdFile.id },
      });
      return;
    }

    const pineconeIndex = pinecone.Index("docuchat");
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    await prismadb.file.update({
      data: { uploadStatus: "SUCCESS" },
      where: { id: createdFile.id },
    });
  } catch (error) {
    console.error(error);
    await prismadb.file.update({
      data: { uploadStatus: "FAILED" },
      where: { id: createdFile.id },
    });
  }

  return { uploadedBy: metadata.userId };
};

export const ourFileRouter = {
  freeUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
};
