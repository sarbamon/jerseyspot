"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { loginUser } from "@/lib/api";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await loginUser({ email, password });
      
      if (data.success && data.user.role === "admin") {
        localStorage.setItem("jerseyspot-admin-auth", "true");
        localStorage.setItem("jerseyspot-admin-token", data.token);
        localStorage.setItem("jerseyspot-admin-user", JSON.stringify(data.user));
        onSuccess();
      } else {
        alert("Not authorized as an admin");
        setLoading(false);
      }
    } catch (error: any) {
      alert(error.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 w-full absolute inset-0 z-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Lock size={32} className="text-black" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wide text-black">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your store
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-4 py-4 text-sm font-bold tracking-wide text-[#f4c84a] transition-colors hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
