import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

const Page = async () => {
  const { userId } = auth();
  const userClerk = await currentUser();
  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prismadb.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!dbUser) {
    const user = await prismadb.user.create({
      data: {
        id: userId,
        email: userClerk?.emailAddresses[0]?.emailAddress,
      },
    });
  }
  redirect("/dashboard");

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default Page;
