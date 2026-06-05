"use client";

import { ArrowRight, Hammer } from "lucide-react";
import type { Company } from "@/lib/types";

export default function WorkshopContent(_props: {
  isLoggedIn: boolean;
  needsCompany: boolean;
  displayName: string | null;
  companies: Company[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-black tracking-[3px] text-norange bg-norange/10 px-2.5 py-1 rounded-full border border-norange/20">
          WORKSHOP
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-2 tracking-tight">
        Your AI Practice{" "}
        <span className="relative inline-block">
          <span className="relative z-10">Arena</span>
          <span className="absolute -bottom-0.5 left-0 right-0 h-2.5 bg-amber/30 rounded-sm -z-0" />
        </span>
      </h1>
      <p className="text-sm text-muted mb-7 max-w-2xl">
        Apply what you learned. Get scored. Level up.
      </p>

      <a
        href="https://aiworkflow-nudgeable.vercel.app/signup"
        target="_blank"
        rel="noopener noreferrer"
        className="group block max-w-lg mx-auto mt-8"
      >
        <div className="rounded-2xl border border-amber/30 bg-white shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="h-1 w-full bg-gradient-to-r from-amber via-norange to-transparent" />
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center">
              <Hammer size={24} className="text-amber" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[2.5px] text-norange uppercase mb-2">
                Free 7-Day Trial
              </p>
              <div className="text-lg font-extrabold text-shadow mb-1">
                Nudgeable AI Work Studio
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">
                Keep pace with practical AI workflows. Pick the AI tool you have, choose a work problem, and practice with guided screenshots and videos.
              </p>
            </div>
            <ul className="flex flex-col gap-1.5 text-left w-full max-w-xs">
              {[
                "New applications added every week",
                "Guided practice with real work problems"
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs text-muted">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-amber/15 text-amber flex items-center justify-center shrink-0 text-[10px] font-black">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-1 px-7 py-3 rounded-full bg-amber text-shadow text-sm font-black group-hover:opacity-90 transition flex items-center gap-2">
              Start your free 7-day trial
              <ArrowRight size={14} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
