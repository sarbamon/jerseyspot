"use client";

import { useStore } from "@/components/StoreProvider";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ArrowLeft, CheckCircle, Save } from "lucide-react";
import { updateUserProfile } from "@/lib/api";

export default function AccountAddressPage() {
  const { user, isAuthenticated, isInitialized, showLoginModal, updateUser } = useStore();

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    houseOrBuilding: "",
    roadAreaColony: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user && user.shippingAddress) {
      setAddress({
        firstName: user.shippingAddress.firstName || user.name?.split(" ")[0] || "",
        lastName: user.shippingAddress.lastName || user.name?.split(" ").slice(1).join(" ") || "",
        phoneNumber: user.shippingAddress.phoneNumber || "",
        houseOrBuilding: user.shippingAddress.houseOrBuilding || user.shippingAddress.streetAddress || "",
        roadAreaColony: user.shippingAddress.roadAreaColony || "",
        landmark: user.shippingAddress.landmark || "",
        city: user.shippingAddress.city || "",
        state: user.shippingAddress.state || "",
        postalCode: user.shippingAddress.postalCode || "",
      });
    } else if (user) {
      setAddress(prev => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
      }));
    }
  }, [user]);

  // Auto-fetch city & state from postal pincode
  useEffect(() => {
    async function fetchPincodeDetails() {
      if (address.postalCode && address.postalCode.length === 6 && /^\d+$/.test(address.postalCode)) {
        setFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${address.postalCode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            setAddress(prev => ({
              ...prev,
              city: postOffice.District || prev.city,
              state: postOffice.State || prev.state
            }));
          }
        } catch (err) {
          console.error("Failed to fetch pincode details:", err);
        } finally {
          setFetchingPincode(false);
        }
      }
    }
    fetchPincodeDetails();
  }, [address.postalCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await updateUserProfile({
        shippingAddress: {
          ...address,
          streetAddress: `${address.houseOrBuilding}${address.roadAreaColony ? `, ${address.roadAreaColony}` : ''}`
        }
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setMessage({ type: "success", text: "Delivery address saved successfully!" });
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: res.message || "Failed to save address." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred while saving address." });
    } finally {
      setLoading(false);
    }
  };

  if (isInitialized && !isAuthenticated) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-5 text-black">
        <h1 className="mb-4 font-serif text-3xl font-bold">Saved Address</h1>
        <p className="text-gray-500 mb-6">Please log in to manage your addresses.</p>
        <button onClick={showLoginModal} className="bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-900">
          LOGIN
        </button>
      </main>
    );
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  const hasSavedAddress = Boolean(user.shippingAddress && user.shippingAddress.city && user.shippingAddress.postalCode);

  return (
    <main className="min-h-screen bg-gray-50 pb-16 pt-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/account" className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black uppercase tracking-wider">
            <ArrowLeft size={16} />
            Back to Account
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-black flex items-center gap-3">
            <MapPin size={30} className="text-black" />
            My Delivery Address
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your default shipping address for faster checkout.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.type === 'success' && <CheckCircle size={18} />}
            {message.text}
          </div>
        )}

        {/* SAVED ADDRESS CARD VIEW */}
        {hasSavedAddress && !isEditing ? (
          <div className="border border-gray-200 bg-white p-6 shadow-sm rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f4c84a] mb-3">
                  Default Shipping Address
                </span>
                <h3 className="font-bold text-lg text-black">
                  {user.shippingAddress?.firstName} {user.shippingAddress?.lastName}
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {user.shippingAddress?.houseOrBuilding && <span>{user.shippingAddress.houseOrBuilding}, </span>}
                  {user.shippingAddress?.roadAreaColony && <span>{user.shippingAddress.roadAreaColony}, </span>}
                  {user.shippingAddress?.streetAddress && !user.shippingAddress?.houseOrBuilding && <span>{user.shippingAddress.streetAddress}, </span>}
                  {user.shippingAddress?.landmark && <span>Near {user.shippingAddress.landmark}, </span>}
                  <br />
                  <span className="font-medium text-black">{user.shippingAddress?.city}, {user.shippingAddress?.state} - {user.shippingAddress?.postalCode}</span>
                </p>
                {user.shippingAddress?.phoneNumber && (
                  <p className="text-sm text-gray-600 mt-2 font-mono">
                    <span className="font-bold text-gray-700">Phone:</span> {user.shippingAddress.phoneNumber}
                  </p>
                )}
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="rounded border border-black bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-black hover:text-[#f4c84a]"
              >
                Edit Address
              </button>
            </div>
          </div>
        ) : (
          /* EDIT / ADD ADDRESS FORM */
          <div className="border border-gray-200 bg-white p-6 shadow-sm rounded-lg">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="font-serif text-xl font-bold">
                {hasSavedAddress ? "Edit Shipping Address" : "Add Shipping Address"}
              </h2>
              {hasSavedAddress && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={address.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={address.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={address.phoneNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={(e) => setAddress(prev => ({ ...prev, postalCode: e.target.value.replace(/\D/g, '') }))}
                    maxLength={6}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                    placeholder="6-digit Pincode"
                    required
                  />
                  {fetchingPincode && <p className="text-xs text-gray-500 mt-1">Fetching city & state...</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Flat, House No., Building *</label>
                <input
                  type="text"
                  name="houseOrBuilding"
                  value={address.houseOrBuilding}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="e.g. Flat 302, Green Apartments"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Area, Street, Sector, Village *</label>
                <input
                  type="text"
                  name="roadAreaColony"
                  value={address.roadAreaColony}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="e.g. Sector 14, MG Road"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={address.landmark}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="e.g. Near Metro Station"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded bg-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[#f4c84a] transition hover:bg-gray-900 disabled:opacity-50"
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Address"}
                </button>

                {hasSavedAddress && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded border border-gray-300 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
