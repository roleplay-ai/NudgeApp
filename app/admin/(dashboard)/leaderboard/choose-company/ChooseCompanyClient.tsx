"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, Search, ArrowLeft } from "lucide-react";

type Company = { id: string; name: string };

export default function ChooseCompanyClient({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawType = searchParams?.get("type");
  const type = rawType === "practice" ? "practice" : rawType === "play" ? "play" : "total";

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(needle));
  }, [companies, q]);

  function go(companyId: string | null) {
    const params = new URLSearchParams();
    if (type !== "total") params.set("type", type);
    if (companyId) params.set("company", companyId);
    const suffix = params.toString();
    router.push(suffix ? `/admin/leaderboard?${suffix}` : "/admin/leaderboard");
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-homeClay" />
            <h1 className="text-3xl font-extrabold text-homeInk tracking-tight">Choose a company</h1>
          </div>
          <p className="text-sm text-muted mt-1">
            Search and pick a company to filter the leaderboard. You can switch anytime.
          </p>
        </div>

        <Link
          href={type !== "total" ? `/admin/leaderboard?type=${type}` : "/admin/leaderboard"}
          className="inline-flex items-center gap-2 rounded-xl border border-nborder bg-white px-4 py-2 text-sm font-bold text-homeInk hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} /> Back to leaderboard
        </Link>
      </div>

      <div className="rounded-2xl border border-nborder bg-white overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-nborder bg-homeCanvas">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies…"
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-nborder bg-white text-sm font-semibold text-homeInk outline-none focus:ring-4 focus:ring-homeClay/10 focus:border-homeClay"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs font-bold tracking-widest text-muted">
              {filtered.length.toLocaleString()} results
            </div>
            <button
              type="button"
              onClick={() => go(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-shadow text-white px-4 py-2 text-sm font-extrabold hover:opacity-95 transition"
            >
              View all companies
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {filtered.length === 0 ? (
            <div className="py-14 text-center">
              <div className="text-sm font-bold text-homeInk">No matches</div>
              <div className="text-xs text-muted mt-1">Try a shorter name or clear the search.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => go(c.id)}
                  className="group text-left rounded-2xl border border-nborder bg-white hover:border-homeClay/40 hover:bg-homeCanvas transition p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-homeClay/10 border border-homeClay/20 flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-homeClay" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-homeInk truncate">{c.name}</div>
                      <div className="text-xs text-muted mt-1">
                        Click to open leaderboard
                        <span className="text-homeClay font-bold group-hover:translate-x-0.5 inline-block transition">
                          {" "}
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

