"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AdminLogin from "./AdminLogin";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem("jerseyspot-admin-auth") === "true";
    const collapsedStatus = localStorage.getItem("jerseyspot-admin-sidebar-collapsed") === "true";
    setIsAuthenticated(authStatus);
    setIsSidebarCollapsed(collapsedStatus);
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("jerseyspot-admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("jerseyspot-admin-auth");
    localStorage.removeItem("jerseyspot-admin-token");
    localStorage.removeItem("jerseyspot-admin-user");
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className={`flex flex-1 flex-col transition-all duration-300 min-w-0 w-full ${isSidebarCollapsed ? "lg:ml-0" : "lg:ml-64"}`}>
        <Topbar 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onLogout={handleLogout}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
