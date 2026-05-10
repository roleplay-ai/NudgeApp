/** Cookie used when OAuth redirect URL must match Supabase allow list exactly (no ?next= on redirect_to). */
export const OAUTH_NEXT_COOKIE = "sb_auth_next";
export const OAUTH_NEXT_COOKIE_MAX_AGE_S = 600;

/** Non-HttpOnly so login/signup pages can set from JS before redirect to IdP. */
export function setOAuthNextCookie(path: string) {
  const safe =
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : "/";
  document.cookie = `${OAUTH_NEXT_COOKIE}=${encodeURIComponent(safe)};path=/;max-age=${OAUTH_NEXT_COOKIE_MAX_AGE_S};SameSite=Lax`;
}
