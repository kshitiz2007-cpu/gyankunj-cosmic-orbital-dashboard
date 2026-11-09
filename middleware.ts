import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeNext(value: string | null, origin: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const target = new URL(value, origin);
    return target.origin === origin ? target.pathname + target.search + target.hash : "/";
  } catch {
    return "/";
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // This route is deliberately public and uses local demo data only.
  // It must remain reachable even when Supabase environment variables are absent.
  if (pathname === "/dashboard-preview") return NextResponse.next();

  const isLoginRoute = pathname === "/login";
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/design-system-preview");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (isLoginRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login?reason=auth-config", request.url));
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
    if (isLoginRoute) return response;
    const destination = new URL("/login", request.url);
    destination.searchParams.set("next", safeNext(pathname + request.nextUrl.search, request.nextUrl.origin));
    const redirect = NextResponse.redirect(destination);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();

  if (profileError) {
    if (isLoginRoute) return response;
    if (isAdminRoute) return NextResponse.redirect(new URL("/login?reason=security-migration", request.url));
    return response;
  }
  if (!profile || profile.is_active === false) {
    await supabase.auth.signOut();
    const redirect = NextResponse.redirect(new URL("/login?reason=account-disabled", request.url));
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  if (isLoginRoute) {
    const destination = new URL(safeNext(request.nextUrl.searchParams.get("next"), request.nextUrl.origin), request.url);
    const redirect = NextResponse.redirect(destination);
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
  matcher: ["/((?!auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
