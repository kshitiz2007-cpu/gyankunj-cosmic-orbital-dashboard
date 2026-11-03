import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!supabaseUrl || !supabaseKey) {
    return isAdminRoute
      ? NextResponse.redirect(new URL("/login?reason=auth-config", request.url))
      : NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    if (!isAdminRoute) return response;
    const destination = new URL("/login", request.url);
    destination.searchParams.set("next", "/admin");
    const redirect = NextResponse.redirect(destination);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    // Keep student access available while the one-time security migration is pending.
    // Admin routes fail closed until is_active and the audit table exist.
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/login?reason=security-migration", request.url));
    }
    return response;
  }

  if (!profile || profile.is_active === false) {
    await supabase.auth.signOut();
    const redirect = NextResponse.redirect(new URL("/login?reason=account-disabled", request.url));
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }

  if (isAdminRoute && (profile.role !== "admin" || profile.is_active !== true)) {
    const redirect = NextResponse.redirect(new URL("/profile?access=denied", request.url));
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/((?!login|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
