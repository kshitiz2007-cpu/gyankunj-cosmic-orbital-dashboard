import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const appOrigin = "https://gyankunj-cosmic-orbital-dashboard.onrender.com";
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const authError = searchParams.get("error_description") || searchParams.get("error");
  if (authError) return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent(authError), appOrigin));
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
  if (error) return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent(error.message), appOrigin));
  return NextResponse.redirect(new URL(next, appOrigin));
}
