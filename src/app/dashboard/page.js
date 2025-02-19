import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import Dashboard from "@/components/Dashboard";
import { getUserSubscriptionPlan } from "@/lib/stripe";

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
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard files={fileList} subscriptionPlan={subscriptionPlan} />;
};

export default Page;
