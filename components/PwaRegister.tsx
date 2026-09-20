"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("PWA Service Worker registration failed:", error);
          });
      });
    }

    // 2. Capture PWA Install Prompt Event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the PWA install prompt");
    } else {
      console.log("User dismissed the PWA install prompt");
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_install_dismissed", "true");
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm rounded-2xl bg-black border border-gray-800 p-4 shadow-2xl text-white backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4c84a] text-black font-black text-xs shadow-sm">
            JS
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Install Jersey Spot App</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Quick access & offline browsing</p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#f4c84a] py-2 text-xs font-bold text-black transition-colors hover:bg-amber-400"
        >
          <Download size={14} />
          <span>Install Now</span>
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-xl border border-gray-800 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
}
