import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const Dashboard = async () => {
  const { userId } = auth();
  if (!userId) {
    // return new NextResponse("Unauthenticated", { status: 403 });
  }
  const user = await currentUser();

  return <div>{userId}</div>;
};

export default Dashboard;
