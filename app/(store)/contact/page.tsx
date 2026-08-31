import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Jersey Spot. We're here to help with your orders and answer any questions about our premium football jerseys.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-center font-serif text-4xl font-bold uppercase tracking-wider text-black">
          Contact Us
        </h1>
        <p className="mb-12 text-center text-sm text-gray-500">
          Have a question about your order or need help finding a jersey? We're here to help.
        </p>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* CONTACT INFO */}
          <div className="bg-gray-50 p-8 border border-gray-200">
            <h2 className="mb-6 font-serif text-2xl font-bold uppercase tracking-wider text-black">
              Get In Touch
            </h2>
            
            <div className="space-y-6">


              <div>
                <h3 className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Email Support</h3>
                <p className="font-serif text-lg text-black">support@jerseyspot.online</p>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Store Location</h3>
                <p className="font-serif text-lg text-black leading-relaxed">
                  Gurugram, GURGAON, HARYANA,<br />
                  122002, India
                </p>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Business Hours</h3>
                <p className="font-serif text-lg text-black leading-relaxed">
                  Monday - Saturday: 10:00 AM - 8:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div>
            <form className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="orderNumber" className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="button"
                className="w-full bg-black px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
