"use client";

import Image from "next/image";

export default function CustomJerseyBanner() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const message = encodeURIComponent("Hi! I would like to order a custom jersey.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <section className="w-full bg-black">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order custom jersey on WhatsApp"
        className="group block w-full relative cursor-pointer overflow-hidden transition-opacity hover:opacity-95"
      >
        <Image
          src="/images/banners/customized.jpg"
          alt="Create your customized jersey - Click to chat on WhatsApp"
          width={1920}
          height={850}
          sizes="100vw"
          className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </a>
    </section>
  );
}