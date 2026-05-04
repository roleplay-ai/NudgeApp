"use client";

import { Download, Share, SquareArrowOutUpRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)");
  const nav = navigator as Navigator & { standalone?: boolean };
  return mq.matches || nav.standalone === true;
}

export default function InstallAppSection({ variant = "full" }: { variant?: "full" | "compact" }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIos());
  }, []);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null);
      setInstalling(false);
    }
  }, [deferred]);

  if (standalone) {
    if (variant === "compact") return null;
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-nborder">
        <div className="text-xs font-bold tracking-wide text-muted uppercase mb-1">App</div>
        <p className="text-sm text-shadow font-medium">You&apos;re using the installed app.</p>
      </div>
    );
  }

  const showBanner = deferred && variant === "full" && !bannerDismissed;

  if (variant === "compact") {
    if (!deferred && !ios) return null;
    return (
      <div className="mt-auto pt-6 border-t border-nborder">
        {deferred ? (
          <button
            type="button"
            onClick={install}
            disabled={installing}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-shadow text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
          >
            <Download size={18} />
            {installing ? "Installing…" : "Install app"}
          </button>
        ) : ios ? (
          <p className="text-[11px] text-muted leading-snug px-1">
            On iPhone: tap Share in Safari, then <strong>Add to Home Screen</strong>.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div id="install-app" className="scroll-mt-8">
      <div className="text-[11px] font-bold tracking-[2px] text-norange mb-2">INSTALL</div>
      <h2 className="text-lg font-extrabold text-shadow mb-3">Use Nudgeable like an app</h2>

      {showBanner && (
        <div className="bg-chiffon border border-nborder rounded-2xl p-4 mb-3 flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-shadow mb-1">Install on this device</div>
            <p className="text-xs text-muted leading-relaxed mb-3">
              Add a home screen shortcut for quick access. Works offline for cached pages after the first visit.
            </p>
            <button
              type="button"
              onClick={install}
              disabled={installing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-shadow text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
            >
              <Download size={18} />
              {installing ? "Installing…" : "Download / install"}
            </button>
          </div>
          <button
            type="button"
            aria-label="Dismiss install suggestion"
            className="p-1 rounded-lg text-muted hover:bg-white/80 shrink-0"
            onClick={() => setBannerDismissed(true)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {!deferred && ios && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-nborder mb-3">
          <div className="text-sm font-bold text-shadow mb-2">Install on iPhone or iPad</div>
          <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
            <li>
              Tap the share icon{" "}
              <Share className="inline align-text-bottom mx-0.5 text-shadow" size={16} strokeWidth={2} /> in Safari.
            </li>
            <li>
              Scroll and tap <strong className="text-shadow">Add to Home Screen</strong>.
            </li>
          </ol>
        </div>
      )}

      {!deferred && !ios && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-nborder">
          <div className="text-sm font-bold text-shadow mb-2">Install from your browser</div>
          <p className="text-sm text-muted leading-relaxed mb-3">
            Look for &quot;Install app&quot; or an install icon in your browser&apos;s address bar or menu (
            <SquareArrowOutUpRight className="inline align-text-bottom" size={14} />). Use Chrome or Edge for the
            simplest flow.
          </p>
          <p className="text-xs text-muted leading-relaxed">
            After a production build is deployed over HTTPS, supported browsers offer a one-tap install when you revisit
            this page.
          </p>
        </div>
      )}
    </div>
  );
}
