"use client";

import { useStore } from "@/components/StoreProvider";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ArrowLeft, CheckCircle, Save, Plus, Trash2, Edit2, Phone } from "lucide-react";
import { updateUserProfile } from "@/lib/api";

export default function AccountAddressPage() {
  const { user, isAuthenticated, isInitialized, showLoginModal, updateUser } = useStore();

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | "new" | null>(null);
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

  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      const addresses = user.shippingAddresses && user.shippingAddresses.length > 0
        ? user.shippingAddresses
        : (user.shippingAddress && (user.shippingAddress.postalCode || user.shippingAddress.city) ? [user.shippingAddress] : []);
      setSavedAddresses(addresses);
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

  const handleAddNew = () => {
    setEditingIndex("new");
    setMessage(null);
    const nameParts = user?.name ? user.name.split(" ") : [""];
    setAddress({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      phoneNumber: "",
      houseOrBuilding: "",
      roadAreaColony: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
    });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setMessage(null);
    const addr = savedAddresses[index];
    setAddress({
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      phoneNumber: addr.phoneNumber || "",
      houseOrBuilding: addr.houseOrBuilding || addr.streetAddress || "",
      roadAreaColony: addr.roadAreaColony || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
    });
  };

  const handleDelete = async (indexToDelete: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setLoading(true);
    setMessage(null);
    try {
      const updatedList = savedAddresses.filter((_, idx) => idx !== indexToDelete);
      const res = await updateUserProfile({ shippingAddresses: updatedList });
      if (res.success && res.user) {
        updateUser(res.user);
        setMessage({ type: "success", text: "Address removed successfully!" });
      } else {
        setMessage({ type: "error", text: res.message || "Failed to remove address." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to remove address." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const fullStreet = address.houseOrBuilding 
        ? `${address.houseOrBuilding}, ${address.roadAreaColony}${address.landmark ? `, ${address.landmark}` : ''}`
        : (address.roadAreaColony || "");
      const fullAddress = { ...address, streetAddress: fullStreet };

      let updatedList: any[] = [...savedAddresses];
      if (editingIndex === "new") {
        updatedList.push(fullAddress);
      } else if (typeof editingIndex === "number") {
        updatedList[editingIndex] = fullAddress;
      }

      const res = await updateUserProfile({
        shippingAddresses: updatedList,
        shippingAddress: fullAddress
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setMessage({ type: "success", text: "Address saved successfully!" });
        setEditingIndex(null);
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
        <h1 className="mb-4 font-serif text-3xl font-bold">Saved Addresses</h1>
        <p className="text-gray-500 mb-6">Please log in to manage your addresses.</p>
        <button onClick={showLoginModal} className="bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-900">
          LOGIN
        </button>
      </main>
    );
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

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

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-black flex items-center gap-3">
              <MapPin size={28} className="text-black" />
              My Delivery Addresses
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Save multiple delivery addresses for seamless checkout.
            </p>
          </div>

          {editingIndex === null && (
            <button
              onClick={handleAddNew}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f4c84a] shadow-sm transition hover:bg-gray-900"
            >
              <Plus size={16} />
              Add New Address
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.type === 'success' && <CheckCircle size={18} />}
            {message.text}
          </div>
        )}

        {/* LIST OF RECTANGULAR SAVED ADDRESS CARDS */}
        {editingIndex === null ? (
          <div className="space-y-3">
            {savedAddresses.length > 0 ? (
              savedAddresses.map((addr, idx) => (
                <div 
                  key={idx} 
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition hover:border-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#f4c84a]">
                        {idx === 0 ? "Default" : `Address ${idx + 1}`}
                      </span>
                      <h3 className="font-bold text-sm text-black truncate">
                        {addr.firstName} {addr.lastName}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed truncate sm:whitespace-normal">
                      <span>{addr.houseOrBuilding}</span>
                      {addr.roadAreaColony && <span>, {addr.roadAreaColony}</span>}
                      {addr.landmark && <span className="text-gray-500"> (Near: {addr.landmark})</span>}
                      <span className="font-medium text-gray-900 font-sans ml-1">
                        • {addr.city}, {addr.state} - {addr.postalCode}
                      </span>
                    </p>

                    {addr.phoneNumber && (
                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-mono">
                        <Phone size={11} className="text-gray-400" />
                        {addr.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                    <button
                      onClick={() => handleEdit(idx)}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <MapPin size={40} className="mx-auto text-gray-400 mb-3" />
                <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">No Saved Addresses</h3>
                <p className="text-xs text-gray-500 mb-6">You haven't added any shipping addresses yet.</p>
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-900"
                >
                  <Plus size={16} />
                  Add Address Now
                </button>
              </div>
            )}
          </div>
        ) : (
          /* EDIT / ADD ADDRESS FORM */
          <div className="border border-gray-200 bg-white p-6 shadow-sm rounded-xl">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="font-serif text-xl font-bold">
                {editingIndex === "new" ? "Add New Delivery Address" : "Edit Delivery Address"}
              </h2>
              <button
                onClick={() => setEditingIndex(null)}
                className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
              >
                Cancel
              </button>
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
                    className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
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
                    className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
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
                    className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
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
                    className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
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
                  className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
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
                  className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
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
                  className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
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
                    className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
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
                    className="w-full border border-gray-300 bg-white text-black px-4 py-3 rounded-xl text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[#f4c84a] transition hover:bg-gray-900 disabled:opacity-50 shadow-sm"
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="rounded-xl border border-gray-300 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}

