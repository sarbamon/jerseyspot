import Image from "next/image";

const categories = [
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
  },
  {
    name: "Clearance",
    href: "/shop?category=clearance",
    image: "/images/categories/clearance.jpg"
  },
];

export default function CategorySection() {
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

      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <a
            key={category.name}
            href={category.href}
            className="group relative flex aspect-[4/3] items-end overflow-hidden bg-gray-900 p-6 text-white"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold tracking-wider">
                {category.name}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}