/**
 * displayName helpers
 * ───────────────────
 * Centralized so the sidebar, home, and profile pages all derive the same
 * "what should we call this person" string from the same inputs.
 *
 * Fallback order (first non-empty wins):
 *   1. `profiles.display_name`   — set by the signup form and synced from
 *                                  Google OAuth in `app/auth/callback`.
 *   2. `user_metadata.full_name` — Supabase email-signup stores the form
 *                                  "name" field here, and most OAuth providers
 *                                  also populate it.
 *   3. `user_metadata.name`      — alt OAuth claim (Google sets this).
 *   4. The literal string `"user"` as a final placeholder so the UI never
 *      collapses to a blank or "Your progress" / "Your account" copy.
 *
 * Always returns a non-empty string for an authenticated viewer. Callers that
 * also support the logged-out case (e.g. the sidebar) should initialise their
 * own `displayName` to `null` *before* invoking this and only assign the
 * result when a user is present.
 */
export const DISPLAY_NAME_FALLBACK = "user";

export function resolveDisplayName(opts: {
  profileDisplayName?: string | null;
  metaFullName?: string | null;
  metaName?: string | null;
}): string {
  return (
    opts.profileDisplayName?.trim() ||
    opts.metaFullName?.trim() ||
    opts.metaName?.trim() ||
    DISPLAY_NAME_FALLBACK
  );
}
