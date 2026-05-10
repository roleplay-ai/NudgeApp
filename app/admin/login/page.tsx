"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SITE_HOST_LABEL } from "@/lib/site";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    // Verify the user has admin role before redirecting
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        setErr("This account does not have admin access.");
        setLoading(false);
        return;
      }
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-shadow">
      <div className="w-full max-w-sm">
        <div className="text-[10px] font-bold tracking-[2px] text-amber mb-1 break-all">{SITE_HOST_LABEL}</div>
        <h1 className="text-3xl font-extrabold text-white mb-1">Admin login</h1>
        <p className="text-white/50 text-sm mb-8">Content management access only.</p>

        <form onSubmit={login} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-amber transition"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-amber transition"
          />
          {err && (
            <div className="text-fuchsia text-xs bg-fuchsia/10 rounded-lg px-3 py-2">{err}</div>
          )}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-amber text-shadow font-bold py-3 rounded-full disabled:opacity-50 hover:opacity-90 transition"
          >
            {loading ? "Signing in…" : "Sign in to Admin"}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-8">
          Only users with role = 'admin' can access this panel.
        </p>
      </div>
    </div>
  );
}
