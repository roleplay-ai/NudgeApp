import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { OAUTH_NEXT_COOKIE } from "@/lib/auth/oauthRedirectCookie";

function safeInternalPath(path: string): string {
  const p = path.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return "/";
  return p;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(OAUTH_NEXT_COOKIE)?.value;
  let next = "/";
  if (fromCookie) {
    try {
      next = safeInternalPath(decodeURIComponent(fromCookie));
    } catch {
      next = "/";
    }
  } else {
    next = safeInternalPath(searchParams.get("next") ?? "/");
  }

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sync the Google-provided name into profiles.full_name.
      // Google sets raw_user_meta_data.name (not full_name), so we normalise here
      // for both new and returning OAuth users.
      const oauthUser = sessionData?.user;
      if (oauthUser) {
        const meta = oauthUser.user_metadata ?? {};
        const name: string | undefined =
          meta.full_name?.trim() || meta.name?.trim() || undefined;
        if (name) {
          await supabase
            .from("profiles")
            .update({ full_name: name })
            .eq("id", oauthUser.id)
            .is("full_name", null); // only fill in if not already set by user
        }
      }

      const res = NextResponse.redirect(`${origin}${next}`);
      res.cookies.set(OAUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  const fail = NextResponse.redirect(`${origin}/login?error=auth_failed`);
  fail.cookies.set(OAUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 });
  return fail;
}
