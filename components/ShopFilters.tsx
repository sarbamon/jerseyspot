"use client";

interface ShopFiltersProps {
  currentCategory?: string;
  currentSort?: string;
  categories: { label: string; value: string }[];
}

export default function ShopFilters({
  currentCategory,
  currentSort,
  categories,
}: ShopFiltersProps) {
  const buildQuery = (newParams: Record<string, string | null>) => {
    const p = new URLSearchParams();
    if (currentCategory) p.set("category", currentCategory);
    if (currentSort) p.set("sort", currentSort);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        p.delete(key);
      } else {
        p.set(key, value);
      }
    });

    const str = p.toString();
    return str ? `?${str}` : "/shop";
  };

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:flex lg:flex-wrap">
      {/* CATEGORY DROPDOWN */}
      <div className="w-full lg:w-48">
        <label htmlFor="category-select" className="mb-2 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Category
        </label>
        <div className="relative">
          <select
            id="category-select"
            className="w-full appearance-none border border-black bg-white px-3 py-2.5 pr-10 font-serif text-sm font-bold uppercase tracking-wider text-black focus:outline-none"
            value={currentCategory || ""}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = buildQuery({ category: val || null });
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* SORT BY DROPDOWN */}
      <div className="w-full lg:w-48 lg:ml-auto">
        <label htmlFor="sort-select" className="mb-2 block text-[10px] font-bold text-gray-400 uppercase tracking-widest lg:text-right">
          Sort By
        </label>
        <div className="relative">
          <select
            id="sort-select"
            className="w-full appearance-none border border-black bg-white px-3 py-2.5 pr-10 font-serif text-sm font-bold uppercase tracking-wider text-black focus:outline-none"
            value={currentSort || ""}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = buildQuery({ sort: val || null });
            }}
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
