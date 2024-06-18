import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key parameter is required" }, { status: 400 });
    }

    const file = await prismadb.file.findFirst({
      where: {
        key: key,
        userId: userId,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "No Such File Exists" }, { status: 404 });
    }

    return NextResponse.json(file, { status: 200 });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ error: "An error occurred while fetching the file" }, { status: 500 });
  }
}
