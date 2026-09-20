"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/components/StoreProvider";
import { updateUserProfile } from "@/lib/api";
import { KeyRound, X, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function SetPasswordModal() {
  const { user, isAuthenticated, isInitialized, updateUser } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user needs a password
  const needsPassword = Boolean(
    isAuthenticated && 
    user && 
    (user.hasPassword === false || (user.isGoogleUser && !user.hasPassword))
  );

  useEffect(() => {
    if (!isInitialized) return;
    
    if (needsPassword) {
      const dismissed = sessionStorage.getItem(`dismissed_set_pass_${user?._id}`);
      if (!dismissed) {
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, isInitialized, user, needsPassword]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !needsPassword) return null;

  const handleDismiss = () => {
    if (user?._id) {
      sessionStorage.setItem(`dismissed_set_pass_${user._id}`, "true");
    }
    setIsOpen(false);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "", text: "" };
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
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await updateUserProfile({ password: newPassword });

      if (res.success) {
        if (res.token) {
          localStorage.setItem("jerseyspot-token", res.token);
        }
        if (res.user) {
          updateUser(res.user);
        }
        setSuccess("Password set successfully! You can now log in directly with your email & password.");
        setTimeout(() => {
          setIsOpen(false);
        }, 1800);
      } else {
        setError(res.message || "Failed to set password.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while setting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl transition-all border border-gray-100 text-gray-900 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* HEADER ICON & TITLE */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <KeyRound size={24} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900">Set Account Password</h3>
            <p className="text-xs text-gray-500 mt-0.5">Quick account setup</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-6 leading-relaxed bg-amber-50/80 border border-amber-200/60 rounded-xl p-3">
          Welcome <span className="font-semibold text-gray-900">{user?.name || user?.email}</span>! Set a password below so you can sign in directly using your email alongside Google login.
        </p>

        {/* ERROR / SUCCESS ALERTS */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="modal-new-password" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
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
                id="modal-new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2.5 pl-3.5 pr-10 text-sm text-gray-900 transition focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* STRENGTH BAR */}
            {newPassword && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className={`h-1 flex-1 rounded-full ${strength.score >= 1 ? strength.color : "bg-gray-200"} transition-all`} />
                <div className={`h-1 flex-1 rounded-full ${strength.score >= 2 ? strength.color : "bg-gray-200"} transition-all`} />
                <div className={`h-1 flex-1 rounded-full ${strength.score >= 3 ? strength.color : "bg-gray-200"} transition-all`} />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="modal-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="modal-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2.5 pl-3.5 pr-10 text-sm text-gray-900 transition focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black py-3 text-xs font-bold uppercase tracking-wider text-[#f4c84a] shadow-md transition hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? "Setting Password..." : "Save Password"}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Remind Me Later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
