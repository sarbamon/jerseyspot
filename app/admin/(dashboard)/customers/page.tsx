"use client";

import { useEffect, useState } from "react";
import { getUsers, adminResetUserPassword } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Search, Key, Eye, EyeOff, RefreshCw, X, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Password Reset
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers();
        if (data && data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Filter customers by name, email, or phone
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = user.name?.toLowerCase().includes(query);
    const emailMatch = user.email?.toLowerCase().includes(query);
    const phoneMatch = user.shippingAddress?.phoneNumber?.toLowerCase().includes(query);

    return nameMatch || emailMatch || phoneMatch;
  });

  const handleOpenResetModal = (user: any) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowPassword(false);
    setModalError("");
  };

  const handleCloseResetModal = () => {
    setSelectedUser(null);
    setNewPassword("");
    setModalError("");
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "JS#";
    for (let i = 0; i < 7; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setShowPassword(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < 6) {
      setModalError("Password must be at least 6 characters long.");
      return;
    }

    setResetting(true);
    setModalError("");

    try {
      const res = await adminResetUserPassword(selectedUser._id, newPassword);
      setSuccessMessage(res.message || `Password reset successfully for ${selectedUser.name}!`);
      handleCloseResetModal();

      // Clear success notification after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setModalError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-black">
            Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer accounts, search users, and reset user passwords.
          </p>
        </div>

        {!loading && (
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="rounded-full bg-black px-3 py-1 text-white">
              Total: {users.length}
            </span>
            {searchQuery && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                Found: {filteredUsers.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Global Success Notification */}
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 shadow-sm">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-green-600 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
          <p className="text-gray-500">Loading customers...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Phone</th>
                <th className="px-6 py-4 font-bold">Orders</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 text-gray-700">{user.shippingAddress?.phoneNumber || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                      {user.orderCount || 0} {user.orderCount === 1 ? "order" : "orders"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-black text-[#f4c84a]' : 'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenResetModal(user)}
                      className="inline-flex items-center space-x-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-black hover:text-white hover:border-black"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>Reset Password</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? `No customers matching "${searchQuery}".` : "No customers found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reset Password Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2 text-black">
                <Key className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold">Reset Password</h2>
              </div>
              <button
                onClick={handleCloseResetModal}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
              <p><span className="font-bold text-gray-900">Customer:</span> {selectedUser.name}</p>
              <p><span className="font-bold text-gray-900">Email:</span> {selectedUser.email}</p>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="admin-new-password" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="inline-flex items-center space-x-1 text-xs text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Auto-generate</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="admin-new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    required
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-3.5 pr-10 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={handleCloseResetModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  disabled={resetting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="inline-flex items-center space-x-2 rounded-lg bg-black px-5 py-2 text-xs font-semibold text-[#f4c84a] shadow-sm transition hover:bg-gray-900 disabled:opacity-50"
                >
                  {resetting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{resetting ? "Resetting..." : "Save New Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

