import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const file = await prismadb.file.findFirst({
      where: {
        id: body.id,
        userId,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "No Such File Exists" }, { status: 404 });
    }

    await prismadb.file.delete({
      where: {
        id: body.id,
      },
    });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred while deleting the file" }, { status: 500 });
  }
}
