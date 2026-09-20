"use client";

import { Search, UserCircle, Menu, ChevronRight } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

interface TopbarProps {
  onMenuClick: () => void;
  onLogout: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Topbar({ onMenuClick, onLogout, isSidebarCollapsed, onToggleCollapse }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-gray-600 hover:text-black">
          <Menu size={24} />
        </button>

        {isSidebarCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Open side panel"
            className="hidden lg:flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold tracking-wide text-gray-700 transition-colors hover:bg-black hover:text-white"
          >
            <ChevronRight size={16} />
            <span>Open Menu</span>
          </button>
        )}

        <div className="relative hidden w-full max-w-md sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-black focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <NotificationDropdown />
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
        <button onClick={onLogout} className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 transition-colors hover:text-black">
          <UserCircle size={24} />
          <span className="hidden sm:block">LOGOUT</span>
        </button>
      </div>
    </header>
  );
}
