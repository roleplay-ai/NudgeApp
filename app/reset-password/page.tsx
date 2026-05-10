"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { SITE_HOST_LABEL } from "@/lib/site";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase injects the session from the reset link via URL hash.
    // onAuthStateChange fires with PASSWORD_RECOVERY event.
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // If user lands here with a valid session already (hash parsed by Supabase)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
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
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/"), 2500);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-homeSidebar">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald/15 border border-emerald/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-emerald" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
            Password updated!
          </h1>
          <p className="text-white/45 text-sm">Redirecting you to the app…</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-homeSidebar">
        <div className="w-full max-w-sm text-center">
          <Loader2 size={28} className="animate-spin text-homeClay mx-auto mb-4" />
          <p className="text-white/45 text-sm">Verifying your reset link…</p>
          <p className="text-white/25 text-xs mt-3">
            If this takes too long,{" "}
            <Link href="/forgot-password" className="text-homeClay no-underline hover:text-amber">
              request a new link
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-auth-form min-h-screen flex items-center justify-center px-5 bg-homeSidebar text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-[10px] font-bold tracking-[2px] text-homeClay mb-1 break-all">
            {SITE_HOST_LABEL}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Set new password
          </h1>
          <p className="text-white/45 text-sm mt-1">Choose a strong password</p>
        </div>

        <form onSubmit={handleReset} className="space-y-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="New password (min. 8 characters)"
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
            placeholder="Confirm new password"
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
            disabled={loading}
            className="w-full bg-homeClay text-white font-bold py-3 rounded-full disabled:opacity-50 hover:opacity-90 transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Updating…
              </span>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
