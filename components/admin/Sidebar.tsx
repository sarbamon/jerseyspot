"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Tag, X, Image as ImageIcon } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Tag },
    { name: "Ads", href: "/admin/ads", icon: ImageIcon },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-6">
        <Link href="/admin" onClick={() => setIsOpen(false)} className="font-serif text-xl font-bold tracking-widest text-black">
          JS ADMIN
        </Link>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-black">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
        {links.map((link) => {
          // Precise active logic to ensure "/admin" doesn't match "/admin/products"
          const isActive = 
            link.href === "/admin" 
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-bold tracking-wide transition-colors ${
                isActive
                  ? "bg-black text-[#f4c84a]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {link.name}
            </Link>
          );
        })}
      </nav>
      
    </aside>
  );
}
