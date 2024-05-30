import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
  const { userId } = auth();

  const fileList = await prismadb.file.findMany({
    where: {
      userId: userId,
    },
  });
  console.log("fileList", fileList);
  return new Response(fileList);
}
