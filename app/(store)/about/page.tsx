import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Jersey Spot, your premium destination for authentic football apparel and imported jerseys.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center font-serif text-4xl font-bold uppercase tracking-wider text-black">
          About Us
        </h1>
        <div className="space-y-8 font-serif text-[15px] leading-relaxed text-gray-700">
          <p>
            Welcome to <strong className="text-black">Jersey Spot</strong>, your premium destination for the finest football apparel. Founded by passionate football fans, our mission is to bring the authentic stadium experience right to your wardrobe.
          </p>
          <p>
            We specialize in providing high-quality imported football jerseys, including Player Versions, Fan Versions, Retro Kits, and complete Sets. Every piece in our collection is carefully selected to ensure perfect fit, authentic design, and all-day comfort.
          </p>
          <p>
            Whether you are cheering from the stands, playing on the pitch, or simply representing your favorite team on the streets, Jersey Spot guarantees an uncompromising standard of quality. We believe that a jersey is more than just a piece of clothing—it is a symbol of loyalty, passion, and history.
          </p>
          <div className="my-12 border-l-4 border-[#f4c84a] pl-6">
            <h2 className="mb-4 font-serif text-2xl font-bold text-black">Our Promise</h2>
            <p>
              We are committed to delivering excellence. From our rigorous quality checks to our seamless online shopping experience, your satisfaction is our top priority. We constantly update our inventory with the latest kits so you never miss out on representing your club or country.
            </p>
          </div>
          <p>
            Thank you for choosing Jersey Spot. Wear the game. Feel the passion.
          </p>
        </div>
      </div>
    </main>
  );
}
