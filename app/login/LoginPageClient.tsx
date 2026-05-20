"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { setOAuthNextCookie } from "@/lib/auth/oauthRedirectCookie";
import { formatOAuthProviderError } from "@/lib/supabase/oauthErrorMessage";
import { SITE_BRAND_MARK } from "@/lib/site";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const REMEMBER_ME_KEY = "nudgeable_remember_me";
const REMEMBERED_EMAIL_KEY = "nudgeable_remembered_email";
const SESSION_ACTIVE_KEY = "nudgeable_session_active";

export function LoginPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Prefill email if user had "remember me" enabled previously
    const savedRemember = localStorage.getItem(REMEMBER_ME_KEY);
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (savedRemember === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Show error from OAuth callback
    const oauthError = searchParams.get("error");
    if (oauthError === "auth_failed") {
      setErr("Google sign-in failed. Please try again.");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErr(error.message === "Invalid login credentials"
        ? "Incorrect email or password."
        : error.message);
      setLoading(false);
      return;
    }

    // Persist "remember me" preference
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, "true");
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.setItem(REMEMBER_ME_KEY, "false");
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    // Mark this as an active session so we can detect browser-close
    sessionStorage.setItem(SESSION_ACTIVE_KEY, "1");

    const next = searchParams.get("next") ?? "/";
    router.push(next);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setErr(null);

    const nextPath = searchParams.get("next") ?? "/";
    setOAuthNextCookie(nextPath);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Must match Supabase Redirect URLs exactly (no ?next=); post-login path uses cookie.
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setErr(formatOAuthProviderError(error));
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser — no further action needed
  }

  return (
    <div className="dark-auth-form min-h-screen flex items-center justify-center px-5 bg-homeSidebar text-white">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="text-[10px] font-bold tracking-[2px] text-homeClay mb-1 break-all">
            {SITE_BRAND_MARK}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-white/45 text-sm mt-1">
            Sign in to continue your AI learning journey
          </p>
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#1c1c1c] font-semibold rounded-xl px-4 py-3 text-sm hover:bg-white/90 transition disabled:opacity-60 mb-4"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs font-medium">or sign in with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email / password form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-[#fdf9f0] outline-none transition placeholder:text-white/45 focus:border-homeClay"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 pr-11 text-sm text-[#fdf9f0] outline-none transition placeholder:text-white/45 focus:border-homeClay"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Remember me + Forgot password row */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 accent-homeClay cursor-pointer"
              />
              <span className="text-white/55 text-xs">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-homeClay hover:text-amber transition no-underline"
            >
              Forgot password?
            </Link>
          </div>

          {err && (
            <div className="text-fuchsia text-xs bg-fuchsia/10 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-homeClay text-white font-bold py-3 rounded-full disabled:opacity-50 hover:opacity-90 transition mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-white/40 text-xs mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-homeClay hover:text-amber transition font-semibold no-underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
