import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Trophy, Zap, Medal, Gamepad2 } from "lucide-react";
import CompanyFilter from "./CompanyFilter";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  display_name: string | null;
  username: string | null;
  xp: number;
  practice_xp: number;
  play_xp: number;
};

type Company = { id: string; name: string };

const MEDAL_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"];

type LeaderboardType = "total" | "practice" | "play";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { type?: string; company?: string };
}) {
  const rawType = searchParams.type;
  const type: LeaderboardType =
    rawType === "practice" ? "practice" : rawType === "play" ? "play" : "total";
  const companyId = searchParams.company ?? null;
  const admin = createAdminClient();

  const sortCol =
    type === "practice" ? "practice_xp" : type === "play" ? "play_xp" : "xp";

  const [profilesRes, companiesRes] = await Promise.all([
    (() => {
      let q = admin
        .from("profiles")
        .select("id, display_name, username, xp, practice_xp, play_xp")
        .order(sortCol, { ascending: false })
        .limit(100);
      if (companyId) q = q.eq("company_id", companyId);
      return q;
    })(),
    admin.from("companies").select("id, name").order("name"),
  ]);

  const { data: rows, error } = profilesRes;
  const companies: Company[] = (companiesRes.data ?? []) as Company[];
  const users: Row[] = (rows || []) as Row[];
  const selectedCompany = companies.find((c) => c.id === companyId) ?? null;

  function displayName(u: Row) {
    return u.display_name || u.username || "Unknown";
  }

  function initials(u: Row) {
    return displayName(u).slice(0, 2).toUpperCase();
  }

  function primaryXp(u: Row) {
    if (type === "practice") return u.practice_xp;
    if (type === "play") return u.play_xp;
    return u.xp;
  }

  function typeParam(t: LeaderboardType) {
    return companyId
      ? `/admin/leaderboard?type=${t}&company=${companyId}`
      : `/admin/leaderboard?type=${t}`;
  }

  const primaryLabel =
    type === "practice" ? "Practice Points" : type === "play" ? "Play Points" : "Total Points";

  const primaryColor =
    type === "practice" ? "#C07B3A" : "#1A1A2E";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold">Leaderboard</h1>
          <p className="text-sm text-muted mt-1">
            {selectedCompany
              ? `Top 100 users from ${selectedCompany.name} ranked by ${primaryLabel}.`
              : `Top 100 users ranked by ${primaryLabel}.`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Suspense>
            <CompanyFilter companies={companies} />
          </Suspense>
          <Link
            href={
              companyId
                ? `/admin/leaderboard/choose-company?type=${type}&company=${companyId}`
                : `/admin/leaderboard/choose-company?type=${type}`
            }
            className="h-9 inline-flex items-center rounded-lg border border-nborder bg-white px-3 text-sm font-extrabold text-homeInk hover:bg-gray-50 transition"
          >
            Browse
          </Link>
          <div className="flex items-center gap-2 bg-white border border-nborder rounded-xl p-1">
            <Link
              href={typeParam("total")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${
                type === "total" ? "bg-shadow text-white" : "text-muted hover:text-shadow"
              }`}
            >
              <Zap size={13} /> Total Points
            </Link>
            <Link
              href={typeParam("practice")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${
                type === "practice" ? "bg-homeClay text-white" : "text-muted hover:text-shadow"
              }`}
            >
              <Trophy size={13} /> Practice Points
            </Link>
            <Link
              href={typeParam("play")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${
                type === "play" ? "bg-shadow text-white" : "text-muted hover:text-shadow"
              }`}
            >
              <Gamepad2 size={13} /> Play Points
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-4">
          Error loading leaderboard: {error.message}
        </p>
      )}

      {/* Top 3 podium */}
      {users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {([users[1], users[0], users[2]] as Row[]).map((u, podiumIdx) => {
            const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
            const isFirst = rank === 1;
            return (
              <div
                key={u.id}
                className={`flex flex-col items-center rounded-2xl p-5 border text-center ${
                  isFirst ? "bg-amber/10 border-amber/30 -mt-4 pb-9" : "bg-white border-nborder"
                }`}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl mb-2"
                  style={{ backgroundColor: MEDAL_COLORS[rank - 1] }}
                >
                  {initials(u)}
                </div>
                {rank === 1 && <Medal size={18} className="text-amber mb-1" />}
                <div className="font-extrabold text-homeInk text-sm truncate max-w-full">
                  {displayName(u)}
                </div>
                {u.username && u.display_name && (
                  <div className="text-xs text-muted mt-0.5 truncate max-w-full">
                    @{u.username}
                  </div>
                )}
                <div
                  className="mt-3 font-black text-lg tabular-nums"
                  style={{ color: primaryColor }}
                >
                  {primaryXp(u).toLocaleString()} pts
                </div>
                {type === "total" && (
                  <div className="flex gap-3 mt-1">
                    <span className="text-[11px] text-muted tabular-nums">
                      P {u.practice_xp.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted tabular-nums">
                      Q {u.play_xp.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="text-[10px] font-bold tracking-widest text-muted mt-0.5">
                  #{rank}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="bg-white rounded-2xl border border-nborder overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nborder">
              <th className="text-left px-5 py-3 text-xs font-black tracking-widest text-muted w-12">
                #
              </th>
              <th className="text-left px-4 py-3 text-xs font-black tracking-widest text-muted">
                User
              </th>
              {type === "total" && (
                <>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Total Points
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Practice Points
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Play Points
                  </th>
                </>
              )}
              {type === "practice" && (
                <>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Practice Points
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Play Points
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Total Points
                  </th>
                </>
              )}
              {type === "play" && (
                <>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Play Points
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Practice Points
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-black tracking-widest text-muted">
                    Total Points
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const medalColor = i < 3 ? MEDAL_COLORS[i] : null;
              return (
                <tr
                  key={u.id}
                  className="border-b border-nborder last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-3.5 tabular-nums font-bold text-muted text-center">
                    {i < 3 ? (
                      <span
                        className="inline-flex w-6 h-6 rounded-full items-center justify-center text-white text-[10px] font-black"
                        style={{ backgroundColor: medalColor! }}
                      >
                        {i + 1}
                      </span>
                    ) : (
                      <span className="text-muted">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ backgroundColor: medalColor ?? "#6B7280" }}
                      >
                        {initials(u)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-homeInk truncate">
                          {displayName(u)}
                        </div>
                        {u.username && (
                          <div className="text-xs text-muted truncate">@{u.username}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {type === "total" && (
                    <>
                      <td className="px-5 py-3.5 text-right tabular-nums font-bold text-homeInk">
                        {u.xp.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-muted">
                        {u.practice_xp.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-muted">
                        {u.play_xp.toLocaleString()}
                      </td>
                    </>
                  )}
                  {type === "practice" && (
                    <>
                      <td className="px-5 py-3.5 text-right tabular-nums font-bold text-homeInk">
                        {u.practice_xp.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-muted">
                        {u.play_xp.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-muted">
                        {u.xp.toLocaleString()}
                      </td>
                    </>
                  )}
                  {type === "play" && (
                    <>
                      <td className="px-5 py-3.5 text-right tabular-nums font-bold text-homeInk">
                        {u.play_xp.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-muted">
                        {u.practice_xp.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-muted">
                        {u.xp.toLocaleString()}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted text-sm">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
