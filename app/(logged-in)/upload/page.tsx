import BgGradient from "@/components/common/BgGradient";
import UploadForm from "@/components/upload/UploadForm";
import UploadHeader from "@/components/upload/UploadHeader";
import { hasReachedUploadLimit } from "@/utils/user";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function Page() {
  // Layout ensures user is signed in, so user is guaranteed to exist
  const { user } = await withAuth({ ensureSignedIn: true });

  const { hasReachedLimit } = await hasReachedUploadLimit(user.id);
  if (hasReachedLimit) redirect("/dashboard");
  return (
    <section className="min-h-screen">
      <BgGradient className="opacity-50 from-rose-400 via-rose-300 to-orange-200" />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <UploadHeader />
          <UploadForm />
        </div>
      </div>
    </section>
  );
}
