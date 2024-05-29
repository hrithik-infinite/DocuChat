import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import Dashboard from "@/components/Dashboard";

const Page = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const dbUser = await prismadb.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!dbUser) {
    redirect("/auth-callback?origin=dashboard");
  }

  const fileList = await prismadb.file.findMany({
    where: {
      userId: userId,
    },
  });
  console.log("filelisttt" , fileList)
  return <Dashboard files = {fileList} />;
};

export default Page;
