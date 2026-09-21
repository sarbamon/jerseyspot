"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Trash2, Plus, Minus, MapPin, Edit2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { getRazorpayKey, placeOrder, verifyPayment, validateCoupon, getSiteConfig, checkPincode, getAds, updateUserProfile } from "@/lib/api";

export default function CheckoutPage() {
  const { cart, isInitialized, isAuthenticated, showLoginModal, clearCart, user, updateUser, updateQuantity, removeFromCart } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adsList, setAdsList] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Address Selection State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | "new">(0);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      getAds(true).then((data) => {
        if (data && data.ads && data.ads.length > 0) {
          setAdsList(data.ads);
        }
      }).catch(err => console.error("Failed to load ads:", err));
    }
  }, [success]);

  useEffect(() => {
    if (!success || adsList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adsList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [success, adsList]);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", houseOrBuilding: "", roadAreaColony: "", landmark: "", city: "", state: "", postalCode: ""
  });
  const [deliveryCharge, setDeliveryCharge] = useState(150);
  
  // Pincode Serviceability State
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");

  const savedAddresses = user?.shippingAddresses && user.shippingAddresses.length > 0
    ? user.shippingAddresses
    : (user?.shippingAddress && (user.shippingAddress.postalCode || user.shippingAddress.city) ? [user.shippingAddress] : []);

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
        const nameParts = user.name ? user.name.split(" ") : [""];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const addresses = user.shippingAddresses && user.shippingAddresses.length > 0
          ? user.shippingAddresses
          : (user.shippingAddress && (user.shippingAddress.postalCode || user.shippingAddress.city) ? [user.shippingAddress] : []);

        if (addresses.length > 0 && selectedAddressIndex !== "new") {
          const idx = typeof selectedAddressIndex === "number" && selectedAddressIndex < addresses.length ? selectedAddressIndex : 0;
          const addr = addresses[idx];
          setShipping({
            firstName: addr.firstName || firstName,
            lastName: addr.lastName || lastName,
            email: addr.email || user.email || "",
            phoneNumber: addr.phoneNumber || "",
            houseOrBuilding: addr.houseOrBuilding || addr.streetAddress || "",
            roadAreaColony: addr.roadAreaColony || "",
            landmark: addr.landmark || "",
            city: addr.city || "",
            state: addr.state || "",
            postalCode: addr.postalCode || "",
          });
        } else if (addresses.length === 0) {
          setSelectedAddressIndex("new");
          setShipping(prev => ({
            ...prev,
            firstName: firstName,
            lastName: lastName,
            email: user.email || "",
          }));
        }
      }
    }
  }, [isInitialized, isAuthenticated, showLoginModal, user, selectedAddressIndex]);

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
          setIsServiceable(res.isServiceable ?? true);
          if (res.isServiceable) {
            setPincodeMessage("Delivery available to this pincode!");
            if (res.locationName) {
              setShipping(prev => ({
                ...prev,
                city: prev.city || res.locationName
              }));
            }
          } else {
            setPincodeMessage("Sorry, we currently do not deliver to this pincode.");
          }
        } catch (err: any) {
          console.error("Failed to check pincode serviceability:", err);
          // Default to true on error so checkout is never blocked by temporary network issues
          setIsServiceable(true);
          setPincodeMessage("");
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
            
            // Save the shipping address to backend & local user state
            try {
              let updatedAddresses = [...savedAddresses];
              const fullStreet = shipping.houseOrBuilding 
                ? `${shipping.houseOrBuilding}, ${shipping.roadAreaColony}${shipping.landmark ? `, ${shipping.landmark}` : ''}`
                : (shipping.roadAreaColony || "");
              const fullAddr = {
                ...shipping,
                streetAddress: fullStreet
              };
              
              if (selectedAddressIndex === "new") {
                updatedAddresses.push(fullAddr);
              } else if (typeof selectedAddressIndex === "number" && selectedAddressIndex < updatedAddresses.length) {
                updatedAddresses[selectedAddressIndex] = { ...updatedAddresses[selectedAddressIndex], ...fullAddr };
              }

              const profileRes = await updateUserProfile({ 
                shippingAddress: fullAddr,
                shippingAddresses: updatedAddresses
              });
              if (profileRes && profileRes.user) {
                updateUser(profileRes.user);
              } else {
                updateUser({ shippingAddress: fullAddr, shippingAddresses: updatedAddresses });
              }
            } catch (e) {
              updateUser({ shippingAddress: shipping });
            }
            
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
        <style>{`
          .checkmark-circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 2;
            stroke-miterlimit: 10;
            stroke: #22c55e;
            fill: none;
            animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          }
          .checkmark {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            display: block;
            stroke-width: 2;
            stroke: #fff;
            stroke-miterlimit: 10;
            margin: 0 auto 24px auto;
            box-shadow: inset 0px 0px 0px #22c55e;
            animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
          }
          .checkmark-check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
          }
          @keyframes stroke {
            100% { stroke-dashoffset: 0; }
          }
          @keyframes scale {
            0%, 100% { transform: none; }
            50% { transform: scale3d(1.1, 1.1, 1); }
          }
          @keyframes fill {
            100% { box-shadow: inset 0px 0px 0px 60px #22c55e; }
          }
          .fade-in-text {
            opacity: 0;
            animation: fadeIn 0.5s ease-in-out 1.2s forwards;
          }
          @keyframes fadeIn {
            100% { opacity: 1; transform: translateY(0); }
            0% { opacity: 0; transform: translateY(10px); }
          }
        `}</style>

        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path className="checkmark-check" fill="none" strokeWidth="4" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        
        <div className="fade-in-text flex flex-col items-center w-full max-w-md">
          <h1 className="mb-4 font-serif text-4xl font-bold">Order Placed!</h1>
          <p className="mb-8 text-center text-gray-500">
            Thank you for your purchase. Your jerseys will be on their way soon!
          </p>
          <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
            <Link href="/shop" className="bg-black px-8 py-4 text-center text-sm font-bold tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900 w-full">
              CONTINUE SHOPPING
            </Link>
            <Link href="/orders" className="border border-gray-300 bg-white px-8 py-4 text-center text-sm font-bold tracking-wider text-black transition-colors hover:bg-gray-50 w-full">
              VIEW MY ORDERS
            </Link>
          </div>

          {/* Ad Banner Slideshow after Order Confirmation */}
          {adsList.length > 0 && (
            <div className="w-full">
              <div className="relative h-[160px] w-full overflow-hidden rounded-xl bg-black shadow-sm border border-gray-200">
                {/* Ad Label in Top Right Corner */}
                <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20 shadow-sm pointer-events-none uppercase tracking-wider">
                  Ad
                </div>

                {/* Slides */}
                {adsList.map((adItem: any, idx: number) => (
                  <Link 
                    href={adItem.link || "#"} 
                    key={adItem._id || idx} 
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentAdIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'}`}
                  >
                    <img 
                      src={adItem.imageUrl} 
                      alt={adItem.name || "Ad"} 
                      className="h-full w-full object-cover"
                    />
                  </Link>
                ))}

                {/* Navigation Indicators */}
                {adsList.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                    {adsList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentAdIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentAdIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
    <main className="min-h-screen bg-white px-3.5 py-6 text-black sm:px-8 sm:py-12 lg:px-12 overflow-x-hidden">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 sm:mb-10 font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wider">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
          {/* SHIPPING FORM */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-8 shadow-sm w-full min-w-0 overflow-hidden">
            <h2 className="mb-6 font-serif text-xl sm:text-2xl font-bold border-b pb-3 flex flex-wrap items-center justify-between gap-2">
              <span>Shipping Information</span>
              {savedAddresses.length > 0 && selectedAddressIndex !== "new" && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-sans font-bold text-gray-600 hover:text-black flex items-center gap-1 bg-gray-100 px-2.5 py-1.5 rounded-lg transition shrink-0"
                >
                  <Edit2 size={13} />
                  {isEditingAddress ? "Hide Details" : "Edit Selected Address"}
                  {isEditingAddress ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </h2>

            {/* SAVED ADDRESS SELECTION CARDS */}
            {savedAddresses.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Choose from saved addresses ({savedAddresses.length})
                </p>
                
                <div className="space-y-3">
                  {savedAddresses.map((addr: any, idx: number) => {
                    const isSelected = selectedAddressIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedAddressIndex(idx);
                          setIsEditingAddress(false);
                          setShipping({
                            firstName: addr.firstName || "",
                            lastName: addr.lastName || "",
                            email: addr.email || user?.email || "",
                            phoneNumber: addr.phoneNumber || "",
                            houseOrBuilding: addr.houseOrBuilding || addr.streetAddress || "",
                            roadAreaColony: addr.roadAreaColony || "",
                            landmark: addr.landmark || "",
                            city: addr.city || "",
                            state: addr.state || "",
                            postalCode: addr.postalCode || "",
                          });
                        }}
                        className={`cursor-pointer rounded-xl border p-3 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full min-w-0 overflow-hidden ${
                          isSelected
                            ? "border-2 border-black bg-gray-50/90 shadow-sm ring-1 ring-black"
                            : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "border-black bg-black text-[#f4c84a]" : "border-gray-300"}`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="font-bold text-sm text-black">
                                {addr.firstName} {addr.lastName}
                              </p>
                              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'bg-black text-[#f4c84a]' : 'bg-gray-100 text-gray-600'}`}>
                                {idx === 0 ? "Default" : `Address ${idx + 1}`}
                              </span>
                            </div>

                            <p className="text-xs text-gray-600 leading-normal break-words">
                              <span>{addr.houseOrBuilding}</span>
                              {addr.roadAreaColony && <span>, {addr.roadAreaColony}</span>}
                              {addr.landmark && <span className="text-gray-500"> (Near: {addr.landmark})</span>}
                              <span className="font-semibold text-gray-900 ml-1">
                                • {addr.city}, {addr.state} - {addr.postalCode}
                              </span>
                            </p>

                            {addr.phoneNumber && (
                              <p className="font-mono text-gray-700 text-[11px] mt-0.5">
                                Phone: {addr.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 self-start sm:self-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAddressIndex(idx);
                              setIsEditingAddress(true);
                              setShipping({
                                firstName: addr.firstName || "",
                                lastName: addr.lastName || "",
                                email: addr.email || user?.email || "",
                                phoneNumber: addr.phoneNumber || "",
                                houseOrBuilding: addr.houseOrBuilding || addr.streetAddress || "",
                                roadAreaColony: addr.roadAreaColony || "",
                                landmark: addr.landmark || "",
                                city: addr.city || "",
                                state: addr.state || "",
                                postalCode: addr.postalCode || "",
                              });
                            }}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:border-black transition"
                          >
                            <Edit2 size={12} />
                            Edit Address
                          </button>
                          {isSelected && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                              <CheckCircle size={12} /> Selected
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* ADD NEW ADDRESS RECTANGULAR CARD */}
                  <div
                    onClick={() => {
                      setSelectedAddressIndex("new");
                      setIsEditingAddress(true);
                      const nameParts = user?.name ? user.name.split(" ") : [""];
                      setShipping({
                        firstName: nameParts[0] || "",
                        lastName: nameParts.slice(1).join(" ") || "",
                        email: user?.email || "",
                        phoneNumber: "",
                        houseOrBuilding: "",
                        roadAreaColony: "",
                        landmark: "",
                        city: "",
                        state: "",
                        postalCode: "",
                      });
                    }}
                    className={`cursor-pointer rounded-xl border border-dashed p-3 transition-all flex items-center justify-center gap-2 text-center w-full min-w-0 ${
                      selectedAddressIndex === "new"
                        ? "border-2 border-black bg-gray-50/90 shadow-sm ring-1 ring-black"
                        : "border-gray-300 bg-gray-50/40 hover:border-black hover:bg-gray-50"
                    }`}
                  >
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-black text-[#f4c84a] flex items-center justify-center shadow-xs shrink-0">
                      <Plus size={13} />
                    </div>
                    <p className="font-bold text-xs uppercase tracking-wider text-black">
                      + Deliver to a New Address
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form id="checkout-form" onSubmit={handlePayment} className="space-y-5 sm:space-y-6">
              {(savedAddresses.length === 0 || selectedAddressIndex === "new" || isEditingAddress) && (
                <>
                  {savedAddresses.length > 0 && selectedAddressIndex !== "new" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800 font-medium mb-4 flex items-center justify-between">
                      <span>Editing address details for this order</span>
                      <button type="button" onClick={() => setIsEditingAddress(false)} className="underline font-bold text-yellow-900">Close</button>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">First Name</label>
                      <input type="text" name="firstName" value={shipping.firstName} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">Last Name</label>
                      <input type="text" name="lastName" value={shipping.lastName} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">Email Address</label>
                    <input type="email" name="email" value={shipping.email} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">Phone Number</label>
                    <input type="tel" name="phoneNumber" value={shipping.phoneNumber} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">House No. / Building Name</label>
                    <input type="text" name="houseOrBuilding" value={shipping.houseOrBuilding} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">Street Address / Area</label>
                    <input type="text" name="roadAreaColony" value={shipping.roadAreaColony} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">Landmark (Optional)</label>
                    <input type="text" name="landmark" value={shipping.landmark} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">Pincode</label>
                      <input type="text" name="postalCode" value={shipping.postalCode} onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setShipping(prev => ({ ...prev, postalCode: val }));
                      }} maxLength={6} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                      {checkingPincode && <p className="text-xs text-gray-500 mt-1">Checking serviceability...</p>}
                      {pincodeMessage && !checkingPincode && (
                        <p className={`text-xs mt-1 font-medium ${isServiceable ? 'text-green-600' : 'text-red-600'}`}>
                          {pincodeMessage}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">City / District</label>
                      <input type="text" name="city" value={shipping.city} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">State</label>
                      <input type="text" name="state" value={shipping.state} onChange={handleChange} className="w-full rounded-xl border border-gray-300 bg-white text-black px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition" required />
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 sm:p-6 shadow-sm backdrop-blur-sm w-full min-w-0 overflow-hidden">
              <h2 className="mb-4 sm:mb-6 font-serif text-lg sm:text-xl font-bold border-b border-gray-200 pb-3">Order Summary</h2>
              
              <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="flex gap-2.5 items-center border border-gray-200/80 bg-white p-2.5 sm:p-3 rounded-xl shadow-xs transition hover:border-gray-300 min-w-0 overflow-hidden">
                    <div className="relative h-14 w-12 sm:h-16 sm:w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                      <Image src={item.image} alt={item.name} fill sizes="60px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-xs text-black truncate">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id, item.size)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 shrink-0"
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Size: {item.size}</p>
                      <div className="mt-1.5 flex items-center justify-between gap-1 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                            className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-200 transition"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-6 sm:w-7 text-center text-xs font-bold text-black">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                            className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-200 transition"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <p className="font-bold text-xs text-black whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* COUPON SECTION */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Gift Card or Discount Code</label>
                <div className="flex gap-2 w-full min-w-0">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    placeholder="Enter code"
                    className="flex-1 min-w-0 rounded-xl border border-gray-300 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm focus:border-black focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="shrink-0 rounded-xl bg-gray-200 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-gray-700 transition-colors hover:bg-gray-300"
                    >
                      REMOVE
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      className="shrink-0 rounded-xl bg-black px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-[#f4c84a] shadow-sm transition-colors hover:bg-gray-900 disabled:opacity-50"
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
                className={`mt-6 sm:mt-8 w-full rounded-xl px-4 py-3.5 sm:px-6 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f4c84a] shadow-lg transition-all ${(loading || isServiceable === false || checkingPincode) ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-900 active:scale-[0.99]'}`}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
                <span>100% Secured by</span>
                <div className="inline-flex items-center gap-1">
                  <svg width="14" height="15" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M78.6 0L24.8 62.5H48.4L21.4 110L94.6 42.5H68.4L78.6 0Z" fill="#3395FF"/>
                  </svg>
                  <span className="font-black text-gray-900 font-sans tracking-tight">Razorpay</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
    </>
  );
}
