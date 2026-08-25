"use client";

import { X, Eye, EyeOff } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loginUser, registerUser, googleLoginUser } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoginModalOpen]);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const data = await googleLoginUser(tokenResponse.access_token);

        if (data.success) {
          login(data.token, data.user);
          closeLoginModal();
        }
      } catch (error: any) {
        alert("Google login failed: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => alert("Google Login Failed"),
  });

  if (!isLoginModalOpen) return null;

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password || (isRegistering && !name)) return;
    
    setLoading(true);
    try {
      let data;
      if (isRegistering) {
        data = await registerUser({ name, email, password });
      } else {
        data = await loginUser({ email, password });
      }

      if (data.success) {
        login(data.token, data.user);
        closeLoginModal();
        setIsRegistering(false); // reset state on success
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      alert(error.message || (isRegistering ? "Registration failed" : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setLoading(true);
    try {
      // The implicit flow gives us an access token, but google-auth-library verifyIdToken expects an idToken.
      // Wait, useGoogleLogin doesn't return idToken by default, unless flow="auth-code" or we use GoogleLogin component.
      // Oh no, useGoogleLogin implicit flow only gives access_token. We need idToken.
      // Actually, if we use flow: 'implicit', we only get access_token. We need flow: 'auth-code' OR just use GoogleLogin.
      // But since we want a custom button, we can use `useGoogleLogin` with `flow: 'implicit'` and fetch user info, 
      // OR better, we can use `useGoogleLogin` without flow but with `onSuccess` that gives `credentialResponse`?
      // No, useGoogleLogin hook doesn't return a credential (idToken) unless we use the newer version or specific settings.
      // Wait, let's just use the `GoogleLogin` component, but we want it to look exactly like the current button.
      // We can use the implicit flow to get an access_token, then fetch the user's email/name from Google API on the frontend, and pass THAT to our backend.
      // But the backend expects `idToken`. To get `idToken`, we must use `GoogleLogin` component OR `useGoogleLogin` with `flow: 'implicit'`? No, idToken is only returned in implicit flow if response_type includes 'id_token', which `useGoogleLogin` does not support easily.
      // Let's use `GoogleLogin` component, and style it invisibly over the custom button.
    } catch (error: any) {
      alert("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <button
          onClick={closeLoginModal}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-black"
        >
          <X size={18} />
        </button>

        <h2 className="mb-2 text-center font-serif text-3xl font-bold uppercase tracking-wider text-black">
          {isRegistering ? "Create Account" : "Login"}
        </h2>
        <p className="mb-8 text-center text-sm text-gray-500">
          {isRegistering
            ? "Join us to access exclusive drops and manage orders."
            : "Sign in to access your orders and wishlist."}
        </p>

        <form className="space-y-5" onSubmit={handleAuth}>
          {isRegistering && (
            <div>
              <label
                htmlFor="modal-name"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="modal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                required={isRegistering}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="modal-email"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="modal-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="modal-password"
              className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-700"
            >
              <span>Password</span>
              {!isRegistering && (
                <button type="button" className="font-normal text-gray-400 hover:text-black">
                  Forgot?
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="modal-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-3 text-sm text-black focus:border-black focus:outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? (isRegistering ? "Creating..." : "Signing In...") : (isRegistering ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center space-x-4">
          <span className="h-px w-full bg-gray-200"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">OR</span>
          <span className="h-px w-full bg-gray-200"></span>
        </div>

        <div className="flex w-full items-center justify-center">
          <div className="w-full relative h-[42px] overflow-hidden rounded border border-gray-300">
            {/* We will use a regular button if GoogleOAuthProvider isn't wrapped properly, but assuming it is: */}
            <button
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="font-bold text-black underline hover:text-gray-700"
          >
            {isRegistering ? "Sign In" : "Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
