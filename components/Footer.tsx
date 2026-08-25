import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black px-5 pt-16 lg:px-10">

      <div className="mx-auto grid max-w-[1420px] gap-12 pb-16 md:grid-cols-2 lg:grid-cols-4">

        <div>
          <Image
            src="/images/logo.jpg"
            alt="Jersey Spot"
            width={110}
            height={60}
            className="mb-6 h-auto w-[110px]"
          />

          <p className="max-w-[260px] font-serif text-[14px] leading-6 text-[#f5d45c]">
            We bring you premium-quality imported football jerseys with
            authentic designs and perfect fit.
          </p>
        </div>

        <div>
          <h3 className="footer-heading">
            INFORMATION
          </h3>

          <div className="flex flex-col gap-4 font-serif text-[14px] text-[#f5d45c]">
            <a href="/">Home</a>
            <a href="/about">About us</a>
            <a href="/terms">Terms & Conditions</a>
          </div>
        </div>

        <div>
          <h3 className="footer-heading">
            SHOP
          </h3>

          <div className="flex flex-col gap-4 font-serif text-[14px] text-[#f5d45c]">
            <a href="/shop/clearance">CLEARANCE</a>
            <a href="/shop/player-version">PLAYER VERSION</a>
          </div>
        </div>

        <div>
          <h3 className="footer-heading">
            CONTACT US
          </h3>

          <p className="font-serif text-[14px] text-[#f5d45c]">
            6001142358
          </p>

          <h3 className="footer-heading mt-10">
            LOCATION
          </h3>

          <p className="max-w-[250px] font-serif text-[14px] leading-6 text-[#f5d45c]">
            Gurugram, GURGAON, HARYANA,
            <br />
            122002
          </p>
        </div>

      </div>

      <div className="border-t border-[#333] py-6">
        <div className="mx-auto flex max-w-[1420px] flex-col items-center justify-between gap-5 md:flex-row">

          <p className="font-serif text-[12px] text-[#f5d45c]">
            © 2026 – Copyright, All Rights reserved. Powered by Akieme Tech
          </p>

          <div className="flex gap-2">
            <div className="flex h-7 w-10 items-center justify-center rounded bg-white text-xs text-black">
              UPI
            </div>

            <div className="flex h-7 w-10 items-center justify-center rounded bg-white text-xs text-blue-600">
              Paytm
            </div>

            <div className="flex h-7 w-10 items-center justify-center rounded bg-white text-xs text-black">
              G Pay
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}