"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";

export default function OrderNotification() {
  const lastTimestampRef = useRef<number>(0);
  const [showToast, setShowToast] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // High pitch (A5)
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed. User may not have interacted with the document yet.", e);
    }
  };

  useEffect(() => {
    // Initial fetch to get current baseline timestamp
    const checkLatestOrder = async (isInitial = false) => {
      try {
        const token = localStorage.getItem("jerseyspot-admin-token");
        if (!token) return;

        const res = await fetch(`${API_URL}/orders/latest-timestamp`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const serverTimestamp = data.timestamp;

          if (!isInitial && serverTimestamp > lastTimestampRef.current) {
            // A new order has been placed since we last checked!
            playNotificationSound();
            setShowToast(true);
            
            // Auto hide toast after 5 seconds
            setTimeout(() => {
              setShowToast(false);
            }, 5000);
          }
          
          if (isInitial || serverTimestamp > lastTimestampRef.current) {
            lastTimestampRef.current = serverTimestamp;
          }
        }
      } catch (err) {
        console.warn("Failed to check for new orders", err);
      }
    };

    checkLatestOrder(true);

    // Poll every 30 seconds
    const interval = setInterval(() => checkLatestOrder(false), 30000);

    return () => clearInterval(interval);
  }, [API_URL]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Bell className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">New Order!</h4>
        <p className="text-sm text-gray-500">A new order has just been placed.</p>
      </div>
      <button 
        onClick={() => setShowToast(false)}
        className="ml-4 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
