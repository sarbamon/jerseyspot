import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromoSection() {
  return (
    <section className="bg-[#050505] px-5 py-16 lg:px-12 lg:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f4c84a]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="mx-auto grid max-w-[1420px] items-center gap-12 lg:grid-cols-2 lg:gap-24 relative z-10">

        <div className="group relative aspect-[4/5] sm:aspect-[1.25] overflow-hidden rounded-2xl shadow-2xl">
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
          
          <Image
            src="/images/banners/promo.jpg"
            alt="Premium football jerseys"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Decorative border frame */}
          <div className="absolute inset-4 border border-white/20 rounded-xl z-20 pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        <div className="text-center lg:text-left lg:px-4 flex flex-col items-center lg:items-start">
          <span className="mb-4 inline-block rounded-full bg-[#f4c84a]/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#f4c84a]">
            PREMIUM COLLECTION
          </span>
          
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            WEAR THE GAME.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4c84a] to-[#d4af37]">
              FEEL THE PASSION.
            </span>
          </h2>

          <p className="mb-10 max-w-md text-base leading-relaxed text-gray-400">
            Experience the ultimate in fan apparel. Our premium football jerseys are crafted for true fans, featuring perfect fits, authentic details, and all-day comfort that stands the test of time.
          </p>

          <Link
            href="/shop"
            className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f4c84a] to-[#d4af37] px-8 py-4 text-sm font-bold tracking-wider text-black transition-all hover:shadow-[0_0_20px_rgba(244,200,74,0.4)] hover:-translate-y-1"
          >
            EXPLORE COLLECTION
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}