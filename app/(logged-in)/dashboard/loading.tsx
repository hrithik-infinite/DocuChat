import BgGradient from "@/components/common/BgGradient";

export default function LoadingDashboard() {
  return (
    <main className="min-h-screen">
      <BgGradient className="opacity-30" />
      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-2 py-12 sm:py-24">
          <div className="flex gap-4 mb-8 justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-rose-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 gap-4 m:gap-6 md:grid-cols-2 lg:grid-cols-3 sm:px-0">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
