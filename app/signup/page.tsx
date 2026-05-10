"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatOAuthProviderError } from "@/lib/supabase/oauthErrorMessage";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  /** When email confirmation is required, Supabase returns a user but no session until they click the link. */
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setErr(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    // Signed in immediately: "Confirm email" is off in Supabase, or user was already confirmed.
    if (data.session) {
      setLoading(false);
      router.push("/");
      router.refresh();
      return;
    }

    // New user pending email confirmation — only then should we promise an email.
    if (data.user && !data.session) {
      setAwaitingEmailConfirm(true);
      setSuccess(true);
      setLoading(false);
      return;
    }

    // No user and no session (e.g. duplicate signup privacy response): do not claim an email was sent.
    setAwaitingEmailConfirm(false);
    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    setErr(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
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
  }

  if (success) {
    return (
      <div className="dark-auth-form min-h-screen flex items-center justify-center px-5 bg-homeSidebar text-white">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald/15 border border-emerald/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-emerald" />
          </div>
          <div className="text-[10px] font-bold tracking-[3px] text-homeClay mb-2">
            NUDGEABLE.AI
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
            {awaitingEmailConfirm ? "Check your inbox" : "Almost there"}
          </h1>
          {awaitingEmailConfirm ? (
            <>
              <p className="text-white/45 text-sm leading-relaxed mb-3">
                We&apos;ve sent a confirmation link to{" "}
                <span className="text-white/70 font-semibold">{email}</span>.
                Open it on this device and tap the link to activate your account.
              </p>
              <p className="text-white/30 text-xs leading-relaxed mb-6">
                No email after a few minutes? Check spam and the Promotions tab. If you already
                signed up with this address, try{" "}
                <Link href="/login" className="text-homeClay hover:text-amber no-underline font-semibold">
                  sign in
                </Link>{" "}
                or{" "}
                <Link href="/forgot-password" className="text-homeClay hover:text-amber no-underline font-semibold">
                  reset password
                </Link>
                .
              </p>
            </>
          ) : (
            <p className="text-white/45 text-sm leading-relaxed mb-6">
              If <span className="text-white/70 font-semibold">{email}</span> is new here, you may
              get a confirmation email shortly. If you already have an account, go to{" "}
              <Link href="/login" className="text-homeClay hover:text-amber no-underline font-semibold">
                sign in
              </Link>{" "}
              instead — duplicate sign-ups don&apos;t send another confirmation for security.
            </p>
          )}
          <Link
            href="/login"
            className="inline-block text-sm text-homeClay hover:text-amber transition font-semibold no-underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-auth-form min-h-screen flex items-center justify-center px-5 bg-homeSidebar text-white">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="text-[10px] font-bold tracking-[3px] text-homeClay mb-1">
            NUDGEABLE.AI
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Create account
          </h1>
          <p className="text-white/45 text-sm mt-1">
            Start your AI fluency journey — it&apos;s free
          </p>
        </div>

        {/* Google sign-up */}
        <button
          type="button"
          onClick={handleGoogleSignup}
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
          <span className="text-white/30 text-xs font-medium">or sign up with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email / password form */}
        <form onSubmit={handleSignup} className="space-y-3">
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
              autoComplete="new-password"
              placeholder="Password (min. 8 characters)"
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

          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-[#fdf9f0] outline-none transition placeholder:text-white/45 focus:border-homeClay"
          />

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
                <Loader2 size={16} className="animate-spin" /> Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-homeClay hover:text-amber transition font-semibold no-underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-white/20 text-[11px] mt-4 leading-relaxed">
          By creating an account you agree to our terms of service and privacy policy.
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
