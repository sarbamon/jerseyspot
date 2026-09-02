import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the privacy policy for Jersey Spot, outlining how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center font-serif text-4xl font-bold uppercase tracking-wider text-black">
          Privacy Policy
        </h1>
        <div className="space-y-8 font-serif text-[14px] leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">1. Information We Collect</h2>
            <p>
              When you visit Jersey Spot, we may collect certain information to provide and improve our services. This includes personal information you provide when creating an account, placing an order, or contacting us (such as your name, email address, shipping address, and payment details), as well as automatically collected data like your IP address, browser type, and browsing behavior on our site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">2. How We Use Your Information</h2>
            <p>
              We use the collected information to process and fulfill your orders, communicate with you regarding your purchases, provide customer support, and send promotional offers (if you have opted in). We also use data analytics to understand how our website is used and to improve our product offerings and user experience.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our website, conducting our business, or servicing you (e.g., payment processors and shipping partners), provided that those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law or protect our or others' rights, property, or safety.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">4. Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-black uppercase tracking-wider">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information held by us. If you wish to exercise any of these rights, please contact our support team. You may also opt out of receiving promotional emails from us by following the unsubscribe instructions included in those emails.
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
