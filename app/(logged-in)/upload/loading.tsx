import BgGradient from "@/components/common/BgGradient";

export default function LoadingUpload() {
  return (
    <section className="min-h-screen">
      <BgGradient className="opacity-50 from-rose-400 via-rose-300 to-orange-200" />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="h-10 w-64 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="w-full max-w-md mt-8 space-y-4">
            <div className="h-12 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-12 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
