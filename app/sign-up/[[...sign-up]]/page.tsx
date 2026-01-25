import BgGradient from "@/components/common/BgGradient";
import { Button } from "@/components/ui/button";
import { getSignUpUrl, withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await withAuth();

  if (user) {
    redirect("/dashboard");
  }

  const signUpUrl = await getSignUpUrl();

  return (
    <section className="flex justify-center items-center lg:min-h-[40vh]">
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
        <BgGradient className="opacity-50" />
        <div className="flex flex-col items-center gap-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Start transforming PDFs into actionable summaries
          </p>
          <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600">
            <a href={signUpUrl}>Sign Up with WorkOS</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
