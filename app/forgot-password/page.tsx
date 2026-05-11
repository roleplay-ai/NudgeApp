"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { SITE_BRAND_MARK } from "@/lib/site";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="dark-auth-form min-h-screen flex items-center justify-center px-5 bg-homeSidebar text-white">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-homeClay/15 border border-homeClay/30 flex items-center justify-center mx-auto mb-5">
            <MailCheck size={30} className="text-homeClay" />
          </div>
          <div className="text-[10px] font-bold tracking-[2px] text-homeClay mb-2 break-all">
            {SITE_BRAND_MARK}
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
            Check your inbox
          </h1>
          <p className="text-white/45 text-sm leading-relaxed mb-6">
            If an account exists for{" "}
            <span className="text-white/70 font-semibold">{email}</span>, we&apos;ve
            sent a password reset link. Check your spam folder if you don&apos;t see it.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-homeClay hover:text-amber transition font-semibold no-underline"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-auth-form min-h-screen flex items-center justify-center px-5 bg-homeSidebar text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-[10px] font-bold tracking-[2px] text-homeClay mb-1 break-all">
            {SITE_BRAND_MARK}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Forgot password?
          </h1>
          <p className="text-white/45 text-sm mt-1 leading-relaxed">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                <Loader2 size={16} className="animate-spin" /> Sending…
              </span>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition no-underline"
          >
            <ArrowLeft size={12} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
