import { SendMessageValidator } from "@/lib/SendMessageValidator";
import { auth } from "@clerk/nextjs/dist/types/server";
import prismadb from "@/lib/prismadb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { pinecone } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { openai } from "@/lib/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const POST = async (req) => {
  const { userId } = auth();
  const body = await req.json();

  const { fileId, message } = SendMessageValidator.parse(body);
  const file = await prismadb.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });
  if (!file) {
    return new Response("Not Found", { status: 404 });
  }

  await prismadb.message.create({
    data: {
      test: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const pineconeIndex = pinecone.Index("docuchat");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });
  const results = await vectorStore.similaritySearch(message, 4);
  const prevMessages = await prismadb.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });
  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? "user" : "assistant",
    content: msg.text,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content: "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
      },
    ],
  });
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await prismadb.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });
  return new StreamingTextResponse(stream);
};
