export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-white px-5 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* HEADER SKELETON */}
        <div className="mb-10 space-y-3">
          <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
        </div>

        {/* SEARCH BAR SKELETON */}
        <div className="mb-8 h-12 w-full max-w-md animate-pulse rounded-lg bg-gray-100" />

        {/* GRID SKELETON */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="relative mb-4 flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 animate-pulse" />

              <div className="mt-auto space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200 pt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
