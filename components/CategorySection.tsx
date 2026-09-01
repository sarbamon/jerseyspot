import Image from "next/image";
import { getSiteConfig, getProducts } from "@/lib/api";

const defaultCategories = [
  {
    name: "Player Version",
    href: "/shop?category=player-version",
    image: "/images/categories/player-version.jpg"
  },
  {
    name: "Fan Version",
    href: "/shop?category=fan-version",
    image: "/images/categories/fan-version.jpg"
  },
  {
    name: "Sets",
    href: "/shop?category=sets",
    image: "/images/categories/sets.jpg"
  },
  {
    name: "Retro",
    href: "/shop?category=retro",
    image: "/images/categories/retro.jpg"
  },
  {
    name: "Recommended",
    href: "/shop?category=recommended",
    image: "/images/hero.jpg"
  }
];

export default async function CategorySection() {
  let categories = defaultCategories;
  try {
    const configData = await getSiteConfig(true);
    if (configData.config && configData.config.categories && configData.config.categories.length > 0) {
      categories = configData.config.categories;
    }
  } catch (error) {
    console.error("Failed to load dynamic categories:", error);
  }

  const availableCategories = categories;

  if (availableCategories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
          Explore
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Shop by Category
        </h2>
      </div>

      {/* Changed to flex-wrap for desktop so it doesn't get cut off, but remains scrollable on mobile if needed, though wrap is usually better for both if items are small. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {availableCategories.map((category) => (
          <a
            key={category.name}
            href={category.href}
            className="group relative flex h-32 sm:h-40 w-full items-center justify-center overflow-hidden bg-black p-4 text-white rounded-md shadow-md"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              className="object-cover opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-60"
            />
            <div className="relative z-10 text-center">
              <h3 className="text-lg sm:text-xl font-bold tracking-wider drop-shadow-xl text-white">
                {category.name}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}