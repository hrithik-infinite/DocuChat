import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = auth();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const file = await prismadb.file.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });
    if (!file) {
      return NextResponse.json({ uploadStatus: "PENDING" }, { status: 200 });
    }
    return NextResponse.json({ ...file }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred while deleting the file" }, { status: 500 });
  }
}
