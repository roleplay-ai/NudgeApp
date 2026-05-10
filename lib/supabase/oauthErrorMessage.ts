import type { AuthError } from "@supabase/supabase-js";

/** User-facing copy when `signInWithOAuth` fails (e.g. provider disabled in Supabase). */
export function formatOAuthProviderError(error: AuthError | null): string {
  if (!error) return "Something went wrong. Please try again.";
  const text = `${error.message ?? ""} ${String((error as { msg?: string }).msg ?? "")}`;
  if (/provider is not enabled/i.test(text) || /Unsupported provider/i.test(text)) {
    return "Google sign-in isn’t enabled for this project yet. In Supabase: Authentication → Providers → Google — turn it on and paste your Google OAuth Client ID and Client Secret. Then add this app’s URL under Authentication → URL Configuration → Redirect URLs.";
  }
  return error.message || "Something went wrong. Please try again.";
}
