export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Skeleton for Header */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="h-10 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="h-10 w-full animate-pulse rounded bg-gray-200 md:w-64"></div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Skeleton for Filters (Desktop) */}
        <div className="hidden w-64 flex-shrink-0 animate-pulse md:block">
          <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full rounded bg-gray-200"></div>
            ))}
          </div>
        </div>

        {/* Skeleton for Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[3/4] w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
