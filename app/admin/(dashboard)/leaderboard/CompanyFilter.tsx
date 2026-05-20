"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Company = { id: string; name: string };

export default function CompanyFilter({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("company", e.target.value);
    } else {
      params.delete("company");
    }
    router.push(`/admin/leaderboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={searchParams.get("company") ?? ""}
        onChange={handleChange}
        className="h-9 rounded-lg border border-nborder bg-white px-3 text-sm font-semibold text-homeInk focus:outline-none focus:ring-2 focus:ring-shadow/30"
      >
        <option value="">All Companies</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Link
        href={`/admin/leaderboard/choose-company${searchParams.get("type") ? `?type=${encodeURIComponent(searchParams.get("type")!)}` : ""}`}
        className="h-9 inline-flex items-center rounded-lg border border-nborder bg-white px-3 text-sm font-extrabold text-homeInk hover:bg-gray-50 transition"
      >
        Search
      </Link>
    </div>
  );
}
