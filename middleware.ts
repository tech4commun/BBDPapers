import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Get User (Refresh session to keep cookie alive)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. BAN CHECK - Block banned users from accessing the site
  if (user && !request.nextUrl.pathname.startsWith("/banned")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_banned")
      .eq("id", user.id)
      .single();

    if (profile?.is_banned) {
      // Sign out the banned user
      await supabase.auth.signOut();
      // Redirect to banned page
      return NextResponse.redirect(new URL("/banned", request.url));
    }
  }

  // 3. GUEST ONLY GUARD (The Fix for "Schrödinger's User")
  // If user is logged in AND tries to go to /login, kick them to explore or their intended destination
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const next = request.nextUrl.searchParams.get("next");
    const redirectUrl = next || "/explore";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // 4. REMOVED: /upload is now public - authentication checked in UploadModal when user clicks upload button

  // 5. ADMIN GUARD
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // If no user, kick to login
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user has admin privileges
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      // Not admin → Redirect to explore
      return NextResponse.redirect(new URL("/explore", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (important to let auth pass)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
