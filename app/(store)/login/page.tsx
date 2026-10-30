"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/StoreProvider";
import { useState } from "react";
import { MessageSquare, Mail, KeyRound, X } from "lucide-react";
import { loginUser, googleLoginUser } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Admin, I forgot my password for my account (${email || "my registered email"}). Please help me reset it.`
  )}`;

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const data = await googleLoginUser(tokenResponse.access_token);
        if (data.success) {
          login(data.token, data.user);
          router.push("/");
        }
      } catch (err: any) {
        setError(err.message || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google login failed"),
  });

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      if (data.success) {
        login(data.token, data.user);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-white px-5 py-20 text-black sm:px-8 lg:px-12">
      <div className="w-full max-w-md border border-gray-200 bg-gray-50 p-8 shadow-sm">
        <h1 className="mb-2 text-center font-serif text-3xl font-bold uppercase tracking-wider text-black">
          Login
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Sign in to access your orders and wishlist.
        </p>

        {error && (
          <div className="mb-6 rounded bg-red-50 p-3 text-center text-sm font-medium text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-700"
            >
              <span>Password</span>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-normal text-gray-400 hover:text-black transition-colors"
              >
                Forgot Password?
              </button>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center space-x-4">
          <span className="h-px w-full bg-gray-200"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">OR</span>
          <span className="h-px w-full bg-gray-200"></span>
        </div>

        <button
          type="button"
          onClick={() => loginWithGoogle()}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 border border-gray-300 bg-white px-6 py-4 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-black underline hover:text-gray-700">
            Create one
          </Link>
        </div>
      </div>

      {/* Forgot Password Contact Support Modal */}
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

            <div className="py-4 text-sm text-gray-600 space-y-3">
              <p>
                To reset your password, please contact our support team on WhatsApp with your registered email address.
              </p>
              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 border border-gray-200">
                Registered Email: <span className="font-semibold text-gray-800">{email || "Not entered"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-[#20ba5a]"
              >
                <MessageSquare className="h-4 w-4" />
                Contact on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
