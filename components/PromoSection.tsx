import Image from "next/image";

export default function PromoSection() {
  return (
    <section className="bg-black px-5 py-14 lg:px-10 lg:py-16">
      <div className="mx-auto grid max-w-[1420px] items-center gap-12 lg:grid-cols-2 lg:gap-20">

        <div className="relative aspect-[1.25] overflow-hidden">
          <Image
            src="/images/banners/promo.jpg"
            alt="Premium football jerseys"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="text-center lg:px-10">
          <h2 className="section-title">
            WEAR THE GAME. FEEL THE PASSION.
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#f5d45c]">
            Premium football jerseys made for true fans with perfect fit,
            authentic design and all day comfort
          </p>

          <a
            href="/shop"
            className="gold-button mt-7 inline-flex"
          >
            SHOP NOW
          </a>
        </div>

      </div>
    </section>
  );
}