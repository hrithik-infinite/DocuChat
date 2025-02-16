import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import Dashboard from "@/components/Dashboard";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");
  
  const dbUser = await prismadb.user.findUnique({
    where: {
      id: user.id
    }
  });

  if (!dbUser) {
    redirect("/auth-callback?origin=dashboard");
  }

  const fileList = await prismadb.file.findMany({
    where: {
      userId: user.id
    }
  });
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard files={fileList} subscriptionPlan={subscriptionPlan} />;
};

export default Page;
