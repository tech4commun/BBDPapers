/**
 * OAuth Callback Route Handler
 * Handles authentication callbacks from OAuth providers (Google, GitHub)
 * 
 * Flow:
 * 1. User clicks "Sign in with Google" → Redirected to Google OAuth
 * 2. Google redirects back to this route with ?code=xxx
 * 3. Exchange code for session tokens
 * 4. Redirect to app (or show error)
 * 
 * Security: Uses server-side Supabase client (never exposes tokens to client)
 */

import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/explore";

  if (code) {
    const supabase = await createClient();

    // Exchange the OAuth code for a user session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success: Redirect to the intended destination
      // Middleware will handle session refresh automatically
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    // Error during code exchange (invalid/expired code, network issue, etc.)
    console.error("OAuth callback error:", error.message);
  }

  // No code provided OR exchange failed → Redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=auth_code_error", requestUrl.origin)
  );
}
