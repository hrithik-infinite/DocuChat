import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const Dashboard = async () => {
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
  // const user = await currentUser();

  return <div>{userId}</div>;
};

export default Dashboard;
