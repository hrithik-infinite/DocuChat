import { SendMessageValidator } from "@/lib/SendMessageValidator";
import { auth } from "@clerk/nextjs/dist/types/server";
import prismadb from "@/lib/prismadb";

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

  
};
