import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileList = await prismadb.file.findMany({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json(fileList, { status: 200 });
  } catch (error) {
    console.error("Error fetching file list:", error);
    return NextResponse.json({ error: "An error occurred while fetching the file list" }, { status: 500 });
  }
}
