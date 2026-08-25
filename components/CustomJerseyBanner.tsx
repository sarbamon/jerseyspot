import Image from "next/image";

export default function CustomJerseyBanner() {
  return (
    <section className="w-full bg-black">
      <Image
        src="/images/banners/customized.jpg"
        alt="Create your customized jersey"
        width={1920}
        height={850}
        sizes="100vw"
        className="block h-auto w-full"
      />
    </section>
  );
}