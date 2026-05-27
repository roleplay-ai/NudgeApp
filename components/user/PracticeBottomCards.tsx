"use client";

const PLAYBOOK_URL = process.env.NEXT_PUBLIC_PLAYBOOK_URL || "";
const BUILD_SESSION_URL = "https://build-session.vercel.app";

export default function PracticeBottomCards({ isLoggedIn }: { isLoggedIn: boolean }) {
  const showPlaybook = isLoggedIn && !!PLAYBOOK_URL;

  async function handlePlaybookOpen(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    let url = PLAYBOOK_URL;
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { data: { session } } = await sb.auth.getSession();
      if (session?.access_token && session?.refresh_token) {
        url = `${PLAYBOOK_URL}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`;
      }
    } catch {
      // fall through to plain URL
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`grid gap-4 mt-10 ${showPlaybook ? "sm:grid-cols-2" : ""}`}>
      {/* Build session — always visible */}
      <a
        href={BUILD_SESSION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-4 rounded-2xl border border-nblue/20 no-underline shadow-md hover:shadow-lg transition-shadow px-5 py-5"
        style={{ backgroundImage: "linear-gradient(125deg, #221d23 60%, #0e1627 100%)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
            style={{ background: "rgba(98,60,234,0.15)", border: "2px solid rgba(98,60,234,0.30)" }}
            aria-hidden
          >
            🤖
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-bold tracking-[0.16em] uppercase m-0 mb-1"
              style={{ color: "#9B7FEF" }}
            >
              Featured · Hands-on
            </p>
            <h3 className="text-[15px] font-extrabold text-white leading-snug m-0 mb-1.5">
              Hands-on AI Agent &amp; Automation Building Session
            </h3>
            <p className="text-[12px] leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.48)" }}>
              A guided, hands-on session to build live AI agents and automations — together, end to end.
            </p>
          </div>
        </div>
        <span
          className="self-start inline-flex items-center rounded-full px-4 py-2 text-[11px] font-extrabold text-white group-hover:brightness-110 transition-[filter] shadow-[0_4px_14px_rgba(98,60,234,0.35)]"
          style={{ backgroundColor: "#623CEA" }}
        >
          Open building session →
        </span>
      </a>

      {/* Playbook — logged-in only */}
      {showPlaybook && (
        <a
          href={PLAYBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handlePlaybookOpen}
          className="group flex flex-col gap-4 rounded-2xl border border-amber/20 no-underline shadow-md hover:shadow-lg transition-shadow px-5 py-5"
          style={{ backgroundImage: "linear-gradient(125deg, #221d23 60%, #2e2110 100%)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
              style={{ background: "rgba(246,138,41,0.15)", border: "2px solid rgba(246,138,41,0.30)" }}
              aria-hidden
            >
              📖
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold tracking-[0.16em] uppercase m-0 mb-1"
                style={{ color: "#F68A29" }}
              >
                AI Workshop
              </p>
              <h3 className="text-[15px] font-extrabold text-white leading-snug m-0 mb-1.5">
                Get your hands on the AI Playbook
              </h3>
              <p className="text-[12px] leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.48)" }}>
                Frameworks to apply AI at work — move to confident AI application.
              </p>
            </div>
          </div>
          <span
            className="self-start inline-flex items-center rounded-full px-4 py-2 text-[11px] font-extrabold text-white group-hover:brightness-110 transition-[filter] shadow-[0_4px_14px_rgba(246,138,41,0.35)]"
            style={{ backgroundColor: "#F68A29" }}
          >
            Open Playbook →
          </span>
        </a>
      )}
    </div>
  );
}
