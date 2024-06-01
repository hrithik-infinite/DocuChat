import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
  const { userId } = auth();

  const fileList = await prismadb.file.findMany({
    where: {
      userId: userId,
    },
  });
  return new Response(fileList);
}
