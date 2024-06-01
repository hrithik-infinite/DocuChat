import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { userId } = auth();
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    const file = await prismadb.file.findFirst({
      where: {
        key: key,
        userId: userId,
      },
    });
    if (!file) {
      return NextResponse.json({ error: "No Such File Exists" }, { status: 404 });
    }
    return NextResponse.json({ ...file }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred while deleting the file" }, { status: 500 });
  }
}
