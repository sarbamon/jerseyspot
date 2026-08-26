"use client";

import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { cartCount, wishlistCount, isAuthenticated, showLoginModal } = useStore();
  const router = useRouter();

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      showLoginModal();
    }
  };

  const closeMenu = () => {
    setMobileMenu(false);
    setShopOpen(false);
    setMoreOpen(false);
    setSearchOpen(false);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    if (q && q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
    setSearchOpen(false);
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-[100] w-full border-b border-[#242424] bg-black text-[#f4c84a] shadow-md">
        <div className="relative mx-auto flex h-[72px] w-full items-center justify-between px-4 sm:px-6 lg:h-[78px] lg:px-10">

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            type="button"
            onClick={() => setMobileMenu((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-start lg:hidden"
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? (
              <X size={26} strokeWidth={1.5} />
            ) : (
              <Menu size={26} strokeWidth={1.5} />
            )}
          </button>

          {/* ================= DESKTOP NAV ================= */}
          <nav className="hidden items-center gap-8 lg:flex">

            <Link
              href="/"
              className="font-serif text-[14px] font-bold tracking-[0.08em] transition-opacity hover:opacity-70"
            >
              HOME
            </Link>

            {/* SHOP */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShopOpen((prev) => !prev)}
                className="flex items-center gap-2 font-serif text-[14px] font-bold tracking-[0.08em]"
              >
                SHOP
                <ChevronDown
                  size={15}
                  strokeWidth={1.5}
                  className={`transition-transform ${
                    shopOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {shopOpen && (
                <div className="absolute left-0 top-full mt-6 w-52 border border-[#292929] bg-black py-2 shadow-xl">
                  <a
                    href="/shop?category=player-version"
                    className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]"
                  >
                    PLAYER VERSION
                  </a>

                  <a
                    href="/shop?category=fan-version"
                    className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]"
                  >
                    FAN VERSION
                  </a>

                  <a
                    href="/shop?category=sets"
                    className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]"
                  >
                    SETS
                  </a>

                  <a
                    href="/shop?category=retro"
                    className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]"
                  >
                    RETRO
                  </a>

                  <a
                    href="/shop?category=recommended"
                    className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]"
                  >
                    RECOMMENDED
                  </a>

                  <a
                    href="/shop?category=clearance"
                    className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]"
                  >
                    CLEARANCE
                  </a>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="font-serif text-[14px] font-bold tracking-[0.08em] transition-opacity hover:opacity-70"
            >
              ABOUT US
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((prev) => !prev)}
                className="flex items-center gap-2 font-serif text-[14px] font-bold tracking-[0.08em]"
              >
                MORE
                <ChevronDown size={15} strokeWidth={1.5} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen && (
                <div className="absolute left-0 top-full mt-6 w-48 border border-[#292929] bg-black py-2 shadow-xl">
                  <a href="/orders" className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]">MY ORDERS</a>
                  <a href="/terms" className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]">TERMS AND CONDITIONS</a>
                  <a href="/contact" className="block px-5 py-3 font-serif text-sm font-bold hover:bg-[#111]">CONTACT US</a>
                </div>
              )}
            </div>
          </nav>

          {/* ================= CENTER LOGO ================= */}
          <Link
            href="/"
            aria-label="Jersey Spot Home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src="/images/logo.jpg"
              alt="Jersey Spot"
              width={110}
              height={60}
              className="h-auto w-[88px] sm:w-[98px]"
              priority
            />
          </Link>

          {/* ================= RIGHT ICONS ================= */}
          <div className="ml-auto flex items-center gap-4 sm:gap-5">

            {/* SEARCH */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Search"
                className="transition-opacity hover:opacity-70"
              >
                <Search size={21} strokeWidth={1.4} />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-full mt-6 w-[280px] border border-[#292929] bg-black p-4 shadow-xl sm:w-[350px]">
                  <form onSubmit={handleSearch}>
                    <div className="flex items-center gap-2 border-b border-[#444] pb-2">
                      <input
                        type="text"
                        name="q"
                        placeholder="Search jerseys..."
                        className="w-full bg-transparent text-sm text-[#f4c84a] placeholder-gray-500 outline-none"
                        autoFocus
                      />
                      <button type="submit" className="text-[#f4c84a] hover:opacity-70">
                        <Search size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* ACCOUNT */}
            <Link
              href="/account"
              onClick={handleAccountClick}
              aria-label="Account"
              className="transition-opacity hover:opacity-70"
            >
              <UserRound size={21} strokeWidth={1.4} />
            </Link>

            {/* WISHLIST */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative transition-opacity hover:opacity-70"
            >
              <Heart size={22} strokeWidth={1.4} />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative transition-opacity hover:opacity-70"
            >
              <ShoppingBag size={21} strokeWidth={1.4} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#f4c84a] text-[9px] font-bold text-black">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[90] bg-black/60 lg:hidden">
          {/* MENU PANEL */}
          <div className="h-full w-[85%] max-w-[380px] overflow-y-auto bg-black text-[#f4c84a] shadow-2xl">

            {/* TOP SPACING FOR HEADER */}
            <div className="h-[72px] border-b border-[#242424]" />

            <nav className="px-3">

              {/* HOME */}
              <a
                href="/"
                onClick={closeMenu}
                className="block border-b border-[#242424] px-2 py-4 font-serif text-sm font-bold"
              >
                HOME
              </a>

              {/* SHOP */}
              <div className="border-b border-[#242424]">

                <button
                  type="button"
                  onClick={() => setShopOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-2 py-4 font-serif text-sm font-bold"
                >
                  SHOP

                  <ChevronDown
                    size={17}
                    strokeWidth={1.5}
                    className={`transition-transform ${
                      shopOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {shopOpen && (
                  <div className="pb-2">

                    <a
                      href="/shop?category=player-version"
                      onClick={closeMenu}
                      className="block px-2 py-3 font-serif text-[13px] font-bold"
                    >
                      PLAYER VERSION
                    </a>

                    <a
                      href="/shop?category=fan-version"
                      onClick={closeMenu}
                      className="block px-2 py-3 font-serif text-[13px] font-bold"
                    >
                      FAN VERSION
                    </a>

                    <a
                      href="/shop?category=sets"
                      onClick={closeMenu}
                      className="block px-2 py-3 font-serif text-[13px] font-bold"
                    >
                      SETS
                    </a>

                    <a
                      href="/shop?category=retro"
                      onClick={closeMenu}
                      className="block px-2 py-3 font-serif text-[13px] font-bold"
                    >
                      RETRO
                    </a>

                    <a
                      href="/shop?category=recommended"
                      onClick={closeMenu}
                      className="block px-2 py-3 font-serif text-[13px] font-bold"
                    >
                      RECOMMENDED
                    </a>

                    <a
                      href="/shop?category=clearance"
                      onClick={closeMenu}
                      className="block px-2 py-3 font-serif text-[13px] font-bold"
                    >
                      CLEARANCE
                    </a>

                  </div>
                )}
              </div>

              {/* ABOUT */}
              <a
                href="/about"
                onClick={closeMenu}
                className="block border-b border-[#242424] px-2 py-4 font-serif text-sm font-bold"
              >
                ABOUT US
              </a>

              {/* TERMS */}
              <a
                href="/terms"
                onClick={closeMenu}
                className="block border-b border-[#242424] px-2 py-4 font-serif text-sm font-bold"
              >
                TERMS AND CONDITIONS
              </a>

              {/* CONTACT US */}
              <a
                href="/contact"
                onClick={closeMenu}
                className="block border-b border-[#242424] px-2 py-4 font-serif text-sm font-bold"
              >
                CONTACT US
              </a>

              {/* MY ACCOUNT */}
              <a
                href="/account"
                onClick={closeMenu}
                className="block border-b border-[#242424] px-2 py-4 font-serif text-sm font-bold"
              >
                MY ACCOUNT
              </a>



            </nav>
          </div>
        </div>
      )}
    </>
  );
}