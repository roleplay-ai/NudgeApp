"use client";
import Link from "next/link";
import type { ApplyTask } from "@/lib/types";

export default function ApplyGrid({ tasks }: { tasks: ApplyTask[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {tasks.map((t) => (
        <Link key={t.id} href={`/apply/${t.id}`}
          className="bg-shadow rounded-2xl p-4 min-h-[110px] flex flex-col justify-between cursor-pointer
            hover:scale-[1.02] transition relative overflow-hidden border-[1.5px]"
          style={{ borderColor: t.color || "#623CEA" }}>
          <div className="absolute -right-2 -top-2 w-14 h-14 rounded-full opacity-15"
            style={{ background: t.color || "#623CEA" }} />
          {t.is_daily && (
            <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber text-shadow px-1.5 py-0.5 rounded-full z-10">
              TODAY
            </span>
          )}
          <div className="text-[13px] font-extrabold text-amber leading-tight tracking-wide relative">
            {t.title}
          </div>
          <div className="text-[11px] text-white/70 leading-tight mt-2 relative">{t.subtitle}</div>
        </Link>
      ))}
      {tasks.length === 0 && (
        <div className="col-span-full text-muted text-sm">No tasks available yet.</div>
      )}
    </div>
  );
}
