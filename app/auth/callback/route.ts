import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function getAppOrigin(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const candidate = configured || request.nextUrl.origin;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return request.nextUrl.origin;
    return parsed.origin;
  } catch {
    return request.nextUrl.origin;
  }
}

function safeNext(value: string | null, origin: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const target = new URL(value, origin);
    return target.origin === origin ? target.pathname + target.search + target.hash : "/";
  } catch {
    return "/";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const appOrigin = getAppOrigin(request);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"), appOrigin);
  if (searchParams.has("error") || searchParams.has("error_description")) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", appOrigin));
  }
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_oauth_code", appOrigin));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/login?error=auth_config", appOrigin));

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth_exchange_failed", appOrigin));
  return NextResponse.redirect(new URL(next, appOrigin));
}
