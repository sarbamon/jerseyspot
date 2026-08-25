"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { getRazorpayKey, placeOrder, verifyPayment } from "@/lib/api";

export default function CheckoutPage() {
  const { cart, isInitialized, isAuthenticated, showLoginModal, clearCart } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", streetAddress: "", city: "", postalCode: ""
  });

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      showLoginModal();
    }
  }, [isInitialized, isAuthenticated, showLoginModal]);

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = subtotal > 0 ? 150 : 0; // Flat ₹150 shipping
  const total = subtotal + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showLoginModal();
      return;
    }
    
    setLoading(true);

    try {
      // 1. Get Razorpay key
      const clientId = await getRazorpayKey();

      // 2. Create order on backend
      const orderItems = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        size: item.size,
        product: item._id
      }));

      const { order, razorpayOrder } = await placeOrder({
        orderItems,
        shippingAddress: shipping,
        itemsPrice: subtotal,
        shippingPrice: shippingCost,
        totalPrice: total
      });

      // 3. Initialize Razorpay Checkout
      const options = {
        key: clientId,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Jersey Spot",
        description: "Premium Jerseys",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order._id,
            });
            setSuccess(true);
            clearCart();
          } catch (error) {
            console.error(error);
            alert("Payment verification failed. Please contact support if amount was deducted.");
          }
        },
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          email: shipping.email,
          contact: shipping.phoneNumber,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 py-20 text-black">
        <p>Please log in to continue to checkout.</p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center bg-white px-5 text-black">
        <CheckCircle size={80} className="mb-6 text-green-500" />
        <h1 className="mb-4 font-serif text-4xl font-bold">Order Placed!</h1>
        <p className="mb-8 text-center text-gray-500">
          Thank you for your purchase. Your jerseys will be on their way soon!
        </p>
        <Link href="/shop" className="bg-black px-8 py-4 text-sm font-bold tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900">
          CONTINUE SHOPPING
        </Link>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center bg-white px-5 text-black">
        <h1 className="mb-4 font-serif text-3xl font-bold">Checkout</h1>
        <p className="mb-8 text-center text-gray-500">Your cart is empty.</p>
        <Link href="/shop" className="bg-black px-8 py-4 text-sm font-bold tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900">
          RETURN TO SHOP
        </Link>
      </main>
    );
  }

  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-10 font-serif text-3xl font-bold uppercase tracking-wider">
          Checkout
        </h1>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* SHIPPING FORM */}
          <div>
            <h2 className="mb-6 font-serif text-xl font-bold border-b pb-2">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">First Name</label>
                  <input type="text" name="firstName" value={shipping.firstName} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Last Name</label>
                  <input type="text" name="lastName" value={shipping.lastName} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Email Address</label>
                <input type="email" name="email" value={shipping.email} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Phone Number</label>
                <input type="tel" name="phoneNumber" value={shipping.phoneNumber} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Street Address</label>
                <input type="text" name="streetAddress" value={shipping.streetAddress} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">City</label>
                  <input type="text" name="city" value={shipping.city} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Postal Code</label>
                  <input type="text" name="postalCode" value={shipping.postalCode} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
                </div>
              </div>
            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <div className="sticky top-24 bg-gray-50 p-6 border border-gray-200">
              <h2 className="mb-6 font-serif text-xl font-bold">Order Summary</h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="flex gap-4">
                    <div className="relative h-20 w-16 shrink-0 bg-gray-100">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-bold line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 mt-1">Size: {item.size} × {item.quantity}</p>
                      <p className="font-bold mt-1">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>₹{shippingCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                form="checkout-form"
                type="submit"
                disabled={loading}
                className="mt-8 w-full bg-black px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
    </>
  );
}
