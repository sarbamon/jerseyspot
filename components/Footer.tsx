import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail } from "lucide-react";

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
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
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-gray-400 transition-colors hover:bg-[#f4c84a] hover:text-black">
              <InstagramIcon />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-gray-400 transition-colors hover:bg-[#f4c84a] hover:text-black">
              <FacebookIcon />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-gray-400 transition-colors hover:bg-[#f4c84a] hover:text-black">
              <TwitterIcon />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-6 font-serif text-sm font-bold tracking-[0.2em] text-white">
            INFORMATION
          </h3>

          <div className="flex flex-col gap-4 font-serif text-[14px] text-gray-400">
            <Link href="/" className="transition-colors hover:text-[#f4c84a]">Home</Link>
            <Link href="/about" className="transition-colors hover:text-[#f4c84a]">About us</Link>
            <Link href="/terms" className="transition-colors hover:text-[#f4c84a]">Terms & Conditions</Link>
          </div>
        </div>

        <div className="lg:col-span-2">
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

        <div className="lg:col-span-4">
          <h3 className="mb-6 font-serif text-sm font-bold tracking-[0.2em] text-white">
            CONTACT US
          </h3>

          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[#f4c84a]">
                <Mail size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Email</p>
                <p className="font-serif text-[15px] text-gray-300">support@jerseyspot.online</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[#f4c84a]">
                <MapPin size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Location</p>
                <p className="font-serif text-[15px] leading-6 text-gray-300">
                  Gurugram, GURGAON, HARYANA,<br />
                  122002
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="border-t border-[#1a1a1a] py-8">
        <div className="mx-auto flex max-w-[1420px] flex-col items-center justify-between gap-6 md:flex-row">

          <p className="font-serif text-[13px] text-gray-500">
            © {new Date().getFullYear()} – Copyright, All Rights reserved. Powered by Akieme Tech
          </p>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">We accept:</span>
            <div className="flex gap-3">
              <div className="flex h-8 w-12 items-center justify-center rounded bg-[#1a1a1a] text-xs font-bold text-white border border-[#333] transition-colors hover:border-[#f4c84a]">
                UPI
              </div>
              <div className="flex h-8 w-12 items-center justify-center rounded bg-[#1a1a1a] text-xs font-bold text-[#00b9f1] border border-[#333] transition-colors hover:border-[#00b9f1]">
                Paytm
              </div>
              <div className="flex h-8 w-12 items-center justify-center rounded bg-[#1a1a1a] text-xs font-bold text-white border border-[#333] transition-colors hover:border-white">
                G Pay
              </div>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}