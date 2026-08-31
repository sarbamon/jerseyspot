"use client";

import { useState, useEffect, useRef, TouchEvent } from "react";
import { Bell, ShoppingBag, X, Trash2 } from "lucide-react";
import Link from "next/link";

interface Order {
  _id: string;
  orderItems: { name: string; quantity: number }[];
  shippingAddress: { firstName: string; lastName: string };
  createdAt: string;
  isPaid: boolean;
}

// Sub-component for individual notification items to handle swipe logic
function NotificationItem({ 
  order, 
  onDismiss, 
  closeDropdown 
}: { 
  order: Order; 
  onDismiss: (id: string) => void;
  closeDropdown: () => void;
}) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef<number | null>(null);
  const currentXRef = useRef<number | null>(null);

  const productNames = order.orderItems.map(item => item.name).join(", ");
  const displayName = productNames.length > 30 ? productNames.substring(0, 30) + "..." : productNames;

  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startXRef.current === null) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    // Only allow swiping left (negative diff)
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100)); // Cap the swipe distance
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (translateX < -50) {
      // Swiped far enough, dismiss
      onDismiss(order._id);
    } else {
      // Snap back
      setTranslateX(0);
    }
    startXRef.current = null;
    currentXRef.current = null;
  };

  return (
    <li className="relative overflow-hidden border-b border-gray-100 last:border-0 group">
      {/* Background Delete Action (revealed on swipe) */}
      <div className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-end pr-6">
        <Trash2 className="text-white h-5 w-5" />
      </div>

      {/* Foreground Content */}
      <div 
        className="relative flex bg-white transition-transform"
        style={{ 
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link 
          href={`/admin/orders`}
          onClick={closeDropdown}
          className="flex-1 flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <ShoppingBag size={18} />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-sm font-medium text-gray-900">
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              ordered {displayName}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </Link>
        
        {/* Desktop X button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDismiss(order._id);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 hover:bg-gray-100 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          title="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </li>
  );
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [showToast, setShowToast] = useState(false);
  const lastTimestampRef = useRef<number>(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed.", e);
    }
  };

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jerseyspot-dismissed-notifications');
      if (saved) {
        setDismissedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading dismissed notifications", e);
    }
  }, []);

  const dismissNotification = (id: string) => {
    const updatedDismissed = [...dismissedIds, id];
    setDismissedIds(updatedDismissed);
    try {
      localStorage.setItem('jerseyspot-dismissed-notifications', JSON.stringify(updatedDismissed));
    } catch (e) {
      // ignore
    }
    
    setOrders(prev => prev.filter(o => o._id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jerseyspot-admin-token");
      if (!token) return;

      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders) {
          // Filter out dismissed notifications
          const savedDismissed = JSON.parse(localStorage.getItem('jerseyspot-dismissed-notifications') || '[]');
          const activeOrders = data.orders.filter((o: Order) => !savedDismissed.includes(o._id));
          
          setOrders(activeOrders.slice(0, 5));
          
          const last24h = new Date();
          last24h.setHours(last24h.getHours() - 24);
          const newOrders = activeOrders.filter((o: Order) => new Date(o.createdAt) > last24h);
          setUnreadCount(newOrders.length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders for notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

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
            // A new order has been placed!
            playNotificationSound();
            setShowToast(true);
            
            // Auto hide toast after 5 seconds
            setTimeout(() => {
              setShowToast(false);
            }, 5000);
            
            // Refetch orders to update the badge immediately
            fetchOrders();
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
    const interval = setInterval(() => checkLatestOrder(false), 30000);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, [API_URL]);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchOrders();
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={toggleDropdown}
          className="relative text-gray-400 transition-colors hover:text-black flex items-center justify-center p-1"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-gray-200 bg-white shadow-xl z-50 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto overflow-x-hidden">
              {loading && orders.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No recent orders</div>
              ) : (
                <ul className="flex flex-col">
                  {orders.map((order) => (
                    <NotificationItem 
                      key={order._id} 
                      order={order} 
                      onDismiss={dismissNotification} 
                      closeDropdown={() => setIsOpen(false)} 
                    />
                  ))}
                </ul>
              )}
            </div>
            
            <div className="border-t border-gray-100 p-3 text-center bg-gray-50 rounded-b-lg">
              <Link 
                href="/admin/orders" 
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all orders
              </Link>
            </div>
          </div>
        )}
      </div>

      {showToast && (
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
      )}
    </>
  );
}
