import Image from "next/image";
import Link from "next/link";

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

export default function Footer({ categories = [] }: { categories?: { name: string; href: string }[] }) {
  return (
    <footer className="bg-[#050505] px-5 pt-20 lg:px-12 border-t border-[#1a1a1a]">

      <div className="mx-auto grid max-w-[1420px] gap-16 pb-20 md:grid-cols-2 lg:grid-cols-12">

        <div className="lg:col-span-4">
          <Image
            src="/images/logo.jpg"
            alt="Jersey Spot"
            width={120}
            height={65}
            className="mb-8 h-auto w-[120px]"
          />

          <p className="max-w-[300px] font-serif text-[15px] leading-relaxed text-gray-400 mb-8">
            We bring you premium-quality imported football jerseys with
            authentic designs and perfect fit. Experience the game like never before.
          </p>

          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/jersey_spot1/?hl=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-gray-400 transition-colors hover:bg-[#f4c84a] hover:text-black"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div className="lg:col-span-4">
          <h3 className="mb-6 font-serif text-sm font-bold tracking-[0.2em] text-white">
            INFORMATION
          </h3>

          <div className="flex flex-col gap-4 font-serif text-[14px] text-gray-400">
            <Link href="/" className="transition-colors hover:text-[#f4c84a]">Home</Link>
            <Link href="/about" className="transition-colors hover:text-[#f4c84a]">About us</Link>
            <Link href="/terms" className="transition-colors hover:text-[#f4c84a]">Terms & Conditions</Link>
            <Link href="/privacy" className="transition-colors hover:text-[#f4c84a]">Privacy Policy</Link>
          </div>
        </div>

        <div className="lg:col-span-4">
          <h3 className="mb-6 font-serif text-sm font-bold tracking-[0.2em] text-white">
            SHOP
          </h3>

          <div className="flex flex-col gap-4 font-serif text-[14px] text-gray-400 uppercase">
            {categories.map((cat, index) => (
              <Link key={index} href={cat.href} className="transition-colors hover:text-[#f4c84a]">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

      </div>

      <div className="border-t border-[#1a1a1a] py-8">
        <div className="mx-auto flex max-w-[1420px] flex-col items-center justify-between gap-6 md:flex-row">

          <p className="font-serif text-[13px] text-gray-500">
            © {new Date().getFullYear()} – Copyright, All Rights reserved. Powered by Akieme Tech
          </p>

          <div className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium text-gray-400 tracking-wide">100% Payment Secured by</span>
            <Image
              src="/images/razorpay-logo-white.png"
              alt="Razorpay"
              width={95}
              height={20}
              className="h-5 w-auto object-contain"
            />
          </div>

        </div>
      </div>

    </footer>
  );
}