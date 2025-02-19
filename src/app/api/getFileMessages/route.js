import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { INFINITE_QUERY_LIMIT } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = auth();
  const body = await req.json();
  const { limit: limitInput, cursor, fileId } = body;
  const limit = limitInput ? limitInput : INFINITE_QUERY_LIMIT;
  const messages = await prismadb.message.findMany({
    take: limit + 1,
    where: {
      userId: userId,
      fileId: fileId,
    },
    orderBy: {
      createdAt: "desc",
    },
    cursor: cursor ? { id: cursor } : undefined,
    select: {
      id: true,
      isUserMessage: true,
      createdAt: true,
      text: true,
    },
  });
  let nextCursor;
  if (messages.length > limit) {
    const nextItem = messages.pop();
    nextCursor = nextItem?.id;
  }

  return NextResponse.json({ messages: messages, nextCursor: nextCursor }, { status: 200 });
}
