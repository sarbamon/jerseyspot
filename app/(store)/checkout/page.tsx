"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { getRazorpayKey, placeOrder, verifyPayment, validateCoupon, getSiteConfig, checkPincode } from "@/lib/api";

export default function CheckoutPage() {
  const { cart, isInitialized, isAuthenticated, showLoginModal, clearCart, user, updateUser } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [success]);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", streetAddress: "", city: "", state: "", postalCode: ""
  });
  const [deliveryCharge, setDeliveryCharge] = useState(150);
  
  // Pincode Serviceability State
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");

  useEffect(() => {
    getSiteConfig().then((data) => {
      if (data && data.config && typeof data.config.deliveryCharge === "number") {
        setDeliveryCharge(data.config.deliveryCharge);
      }
    }).catch(err => console.error("Failed to load delivery charge:", err));
  }, []);

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        showLoginModal();
      } else if (user) {
        // Auto-fill user details and saved shipping address
        const nameParts = user.name ? user.name.split(" ") : [""];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setShipping(prev => ({
          ...prev,
          firstName: user.shippingAddress?.firstName || firstName,
          lastName: user.shippingAddress?.lastName || lastName,
          email: user.shippingAddress?.email || user.email || "",
          phoneNumber: user.shippingAddress?.phoneNumber || prev.phoneNumber,
          streetAddress: user.shippingAddress?.streetAddress || prev.streetAddress,
          city: user.shippingAddress?.city || prev.city,
          state: user.shippingAddress?.state || prev.state || "",
          postalCode: user.shippingAddress?.postalCode || prev.postalCode,
        }));
      }
    }
  }, [isInitialized, isAuthenticated, showLoginModal, user]);

  useEffect(() => {
    async function fetchPincodeDetails() {
      if (shipping.postalCode && shipping.postalCode.length === 6 && /^\d+$/.test(shipping.postalCode)) {
        // 1. Fetch Pincode Details (City/State)
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${shipping.postalCode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            setShipping(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
          }
        } catch (err) {
          console.error("Failed to fetch pincode details", err);
        }
        
        // 2. Check iCarry Serviceability
        setCheckingPincode(true);
        setPincodeMessage("");
        try {
          const res = await checkPincode(shipping.postalCode);
          setIsServiceable(res.isServiceable);
          if (res.isServiceable) {
            setPincodeMessage("Delivery available to this pincode!");
          } else {
            setPincodeMessage("Sorry, we currently do not deliver to this pincode.");
          }
        } catch (err: any) {
          console.error("Failed to check pincode serviceability:", err);
          setIsServiceable(false);
          setPincodeMessage(err.message || "Sorry, we currently do not deliver to this pincode.");
        } finally {
          setCheckingPincode(false);
        }
      } else {
        setIsServiceable(null);
        setPincodeMessage("");
      }
    }
    fetchPincodeDetails();
  }, [shipping.postalCode]);

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((count, item) => count + item.quantity, 0);
  const shippingCost = subtotal > 0 ? Math.min(deliveryCharge * totalItemsCount, 700) : 0;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === "fixed") {
      discountAmount = appliedCoupon.discountValue;
    }
    // Prevent negative total
    if (discountAmount > subtotal) discountAmount = subtotal;
  }
  
  const total = subtotal - discountAmount + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const data = await validateCoupon(couponCode);
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponSuccess(`${data.coupon.code} applied!`);
      } else {
        setCouponError(data.message || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
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
        discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
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
            
            // Save the shipping address to the local user state so it autofills next time
            updateUser({ shippingAddress: shipping });
            
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
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/shop" className="bg-black px-8 py-4 text-center text-sm font-bold tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900 w-full">
            CONTINUE SHOPPING
          </Link>
          <Link href="/orders" className="border border-gray-300 bg-white px-8 py-4 text-center text-sm font-bold tracking-wider text-black transition-colors hover:bg-gray-50 w-full">
            VIEW MY ORDERS
          </Link>
        </div>
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

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Pincode</label>
                  <input type="text" name="postalCode" value={shipping.postalCode} onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setShipping(prev => ({ ...prev, postalCode: val }));
                  }} maxLength={6} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
                  {checkingPincode && <p className="text-xs text-gray-500 mt-1">Checking serviceability...</p>}
                  {pincodeMessage && !checkingPincode && (
                    <p className={`text-xs mt-1 font-medium ${isServiceable ? 'text-green-600' : 'text-red-600'}`}>
                      {pincodeMessage}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">City / District</label>
                  <input type="text" name="city" value={shipping.city} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">State</label>
                  <input type="text" name="state" value={shipping.state} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
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

              {/* COUPON SECTION */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Gift Card or Discount Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    placeholder="Enter code"
                    className="flex-1 border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="bg-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-300"
                    >
                      REMOVE
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      className="bg-black px-6 py-3 text-sm font-bold text-[#f4c84a] transition-colors hover:bg-gray-900 disabled:opacity-50"
                    >
                      {applyingCoupon ? "..." : "APPLY"}
                    </button>
                  )}
                </div>
                {couponError && <p className="mt-2 text-xs font-bold text-red-500">{couponError}</p>}
                {couponSuccess && <p className="mt-2 text-xs font-bold text-green-600">{couponSuccess}</p>}
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
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
                disabled={loading || isServiceable === false || checkingPincode}
                className={`mt-8 w-full px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition-colors ${(loading || isServiceable === false || checkingPincode) ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
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
