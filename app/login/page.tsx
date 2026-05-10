import { Suspense } from "react";
import { LoginPageClient } from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <div className="dark-auth-form min-h-screen flex items-center justify-center px-5 bg-homeSidebar text-white">
      <div className="w-full max-w-sm animate-pulse space-y-6">
        <div className="h-8 bg-white/10 rounded-lg mx-auto w-48" />
        <div className="h-12 bg-white/10 rounded-xl" />
        <div className="h-px bg-white/10" />
        <div className="h-11 bg-white/10 rounded-xl" />
        <div className="h-11 bg-white/10 rounded-xl" />
        <div className="h-12 bg-homeClay/40 rounded-full" />
      </div>
    </div>
  );
}
