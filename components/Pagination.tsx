"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export default function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Helper function to build page numbers array with ellipses if needed
  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-12 mb-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageURL(currentPage - 1)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-[#f4c84a] sm:px-4 sm:text-sm"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 sm:px-4 sm:text-sm">
          Previous
        </span>
      )}

      {/* Page Numbers (1, 2, 3...) */}
      <div className="flex items-center gap-1.5">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 py-1.5 text-xs font-bold text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isCurrent = pageNum === currentPage;

          if (isCurrent) {
            return (
              <span
                key={pageNum}
                className="flex h-9 w-9 items-center justify-center rounded border-2 border-black bg-black text-xs font-bold text-[#f4c84a] shadow-sm sm:h-10 sm:w-10 sm:text-sm"
              >
                {pageNum}
              </span>
            );
          }

          return (
            <Link
              key={pageNum}
              href={createPageURL(pageNum)}
              className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white text-xs font-bold text-black transition-colors hover:bg-black hover:text-[#f4c84a] sm:h-10 sm:w-10 sm:text-sm"
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageURL(currentPage + 1)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-[#f4c84a] sm:px-4 sm:text-sm"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 sm:px-4 sm:text-sm">
          Next
        </span>
      )}
    </div>
  );
}
