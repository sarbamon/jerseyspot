import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the terms and conditions for shopping at Jersey Spot, including shipping, returns, and product quality policies.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center font-serif text-4xl font-bold uppercase tracking-wider text-black">
          Terms & Conditions
        </h1>
        <div className="space-y-8 font-serif text-[14px] leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">1. Introduction</h2>
            <p>
              Welcome to Jersey Spot. By accessing our website and placing an order, you agree to be bound by the following terms and conditions. Please read them carefully before making any purchase.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">2. Product Quality & Variations</h2>
            <p>
              We strive to display our products as accurately as possible. However, slight variations in color and design may occur due to manufacturing processes or your device's display settings. "Player Version" jerseys are athletic fit and typically run tighter than "Fan Version" jerseys. Please consult our sizing guides before purchasing.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">3. Shipping & Delivery</h2>
            <p>
              Orders are typically processed within 2-3 business days. Delivery times vary based on location but generally fall between 5-10 business days for standard shipping. Jersey Spot is not liable for delays caused by logistics partners or unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">4. Returns & Exchanges</h2>
            <p>
              We accept returns within 7 days of delivery for defective or incorrect items only. Customized jerseys (with custom names or numbers) are strictly non-refundable and non-exchangeable unless there is a manufacturing defect. Items must be returned in their original condition with tags attached.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">5. Intellectual Property</h2>
            <p>
              All content on this website, including images, text, and logos, is the property of Jersey Spot or its content suppliers and is protected by applicable copyright laws.
            </p>
          </section>

          <p className="mt-12 text-center text-xs text-gray-500 uppercase tracking-widest">
            Last Updated: August 2026
          </p>
        </div>
      </div>
    </main>
  );
}
