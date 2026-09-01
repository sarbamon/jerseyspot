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

  return (
    <div className="mt-12 mb-8 flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={createPageURL(currentPage - 1)}
          className="border border-gray-300 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-[#f4c84a]"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-400">
          Previous
        </span>
      )}

      <div className="mx-4 flex items-center gap-1 font-serif text-sm font-bold text-gray-500">
        Page <span className="text-black">{currentPage}</span> of <span className="text-black">{totalPages}</span>
      </div>

      {currentPage < totalPages ? (
        <Link
          href={createPageURL(currentPage + 1)}
          className="border border-gray-300 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-[#f4c84a]"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-400">
          Next
        </span>
      )}
    </div>
  );
}
