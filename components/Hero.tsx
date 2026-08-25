import Image from "next/image";

interface HeroProps {
  image?: string;
  title?: string;
  subtitle?: string;
}

export default function Hero({ image, title, subtitle }: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div
        className="
          relative
          aspect-[16/9]
          w-full
          sm:aspect-[1920/850]
          sm:min-h-[500px]
        "
      >
        <Image
          src={image || "/images/hero1.jpg"}
          alt="Jersey Spot football jerseys"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* SHOP BUTTON */}
        <div
          className="
            absolute
            bottom-[7%]
            right-[8%]
            sm:bottom-[9%]
            sm:right-[8%]
            lg:bottom-[10%]
            lg:right-[8%]
          "
        >
          <a
            href="/shop"
            className="
              inline-flex
              min-h-[40px]
              items-center
              justify-center
              bg-[#f4c84a]
              px-5
              py-2
              font-serif
              text-xs
              font-bold
              text-black
              transition
              hover:bg-[#ffd96a]
              sm:min-h-[48px]
              sm:px-8
              sm:py-3
              sm:text-base
              lg:px-10
              lg:py-4
              lg:text-lg
            "
          >
            SHOP NOW
          </a>
        </div>
      </div>
    </section>
  );
}