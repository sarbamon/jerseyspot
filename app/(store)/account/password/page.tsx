"use client";

import { useStore } from "@/components/StoreProvider";
import { useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, RefreshCw, ShieldCheck, KeyRound, MessageSquare, Mail, X } from "lucide-react";
import { updateUserProfile } from "@/lib/api";

export default function AccountPasswordPage() {
  const { user, isAuthenticated, isInitialized, showLoginModal, updateUser } = useStore();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isGoogleOrNoPassword = user?.hasPassword === false || (user?.isGoogleUser && !user?.hasPassword);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Admin, I forgot my password for my account (${user?.email || "my registered email"}). Please help me reset it.`
  )}`;

  // Helper for password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500" };
    if (score <= 4) return { score: 2, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isGoogleOrNoPassword && !oldPassword) {
      setMessage({ type: "error", text: "Current password is required." });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const payload: any = { password: newPassword };
      if (!isGoogleOrNoPassword && oldPassword) {
        payload.oldPassword = oldPassword;
      }

      const res = await updateUserProfile(payload);

      if (res.success) {
        if (res.token) {
          localStorage.setItem("jerseyspot-token", res.token);
        }
        if (res.user) {
          updateUser(res.user);
        }
        setMessage({ type: "success", text: isGoogleOrNoPassword ? "Password set successfully! You can now log in using your password." : "Password updated successfully!" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: res.message || "Failed to update password." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred while updating password." });
    } finally {
      setLoading(false);
    }
  };

  if (isInitialized && !isAuthenticated) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-5 text-black">
        <h1 className="mb-4 font-serif text-3xl font-bold">Password & Security</h1>
        <p className="text-gray-500 mb-6">Please log in to manage your password.</p>
        <button onClick={showLoginModal} className="bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-900">
          LOGIN
        </button>
      </main>
    );
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-16 pt-6">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        
        {/* HEADER BACK NAVIGATION */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/account" className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black uppercase tracking-wider transition-colors">
            <ArrowLeft size={16} />
            Back to Account
          </Link>
        </div>

        {/* PAGE TITLE */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-[#f4c84a] shadow-md">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-black flex items-center gap-2">
              {isGoogleOrNoPassword ? "Set Account Password" : "Password & Security"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isGoogleOrNoPassword 
                ? "Set a custom password to log in directly using your email and password." 
                : "Update your password to keep your account safe and secure."}
            </p>
          </div>
        </div>

        {/* GOOGLE USER INFO NOTICE */}
        {isGoogleOrNoPassword && (
          <div className="mb-6 bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 font-medium flex items-start gap-3 shadow-xs">
            <KeyRound className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950 text-sm mb-0.5">Set a Password for Direct Sign In</span>
              You logged in using Google. Set a password below so you can sign in with either Google or directly using your email and password.
            </div>
          </div>
        )}

        {/* FEEDBACK ALERT */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm border transition-all ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-red-50 text-red-900 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* MAIN FORM CARD */}
        <div className="border border-gray-200 bg-white p-6 sm:p-8 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider">
              <KeyRound size={18} className="text-amber-500" />
              <span>{isGoogleOrNoPassword ? "Create Password" : "Change Password"}</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {isGoogleOrNoPassword ? "Set password" : "All fields required"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* CURRENT PASSWORD (Only for users who already have a password) */}
            {!isGoogleOrNoPassword && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="user-old-password" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Current Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="user-old-password"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required={!isGoogleOrNoPassword}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-3 pl-4 pr-11 text-sm text-gray-900 shadow-none transition focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* NEW PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="user-new-password" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  New Password *
                </label>
                {newPassword && (
                  <span className={`text-xs font-bold ${strength.text}`}>
                    {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="user-new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-3 pl-4 pr-11 text-sm text-gray-900 shadow-none transition focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* STRENGTH BAR */}
              {newPassword && (
                <div className="mt-2.5 flex items-center gap-1.5">
                  <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 1 ? strength.color : "bg-gray-200"} transition-all duration-300`} />
                  <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 2 ? strength.color : "bg-gray-200"} transition-all duration-300`} />
                  <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 3 ? strength.color : "bg-gray-200"} transition-all duration-300`} />
                </div>
              )}
            </div>

            {/* CONFIRM NEW PASSWORD */}
            <div>
              <label htmlFor="user-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  id="user-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-3 pl-4 pr-11 text-sm text-gray-900 shadow-none transition focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <Link
                href="/account"
                className="rounded-xl border border-gray-300 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#f4c84a] shadow-md transition-all hover:bg-gray-900 hover:shadow-lg disabled:opacity-50"
              >
                {loading && <RefreshCw size={15} className="animate-spin" />}
                <span>{loading ? "Updating..." : "Save Password"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FORGOT PASSWORD SUPPORT MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-black">
                <KeyRound className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-base">Forgot Password?</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 text-xs text-gray-600 leading-relaxed">
              To reset your password, chat with us directly on WhatsApp. Our admin team will reset your password for you right away.
            </div>

            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-green-700"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
