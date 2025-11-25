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
import { isEmailBanned } from "@/app/actions/banned-emails";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/explore";

  console.log("🔵 Auth Callback - next param:", next);

  if (code) {
    const supabase = await createClient();

    // Exchange the OAuth code for a user session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if email is banned
      const emailBanned = await isEmailBanned(data.user.email!);
      
      if (emailBanned) {
        console.log("🚫 Banned email attempted login:", data.user.email);
        // Sign out immediately
        await supabase.auth.signOut();
        // Redirect to banned page
        return NextResponse.redirect(new URL("/banned", requestUrl.origin));
      }

      // Success: Redirect to the intended destination
      console.log("✅ Auth success - redirecting to:", next);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    // Error during code exchange
    console.error("OAuth callback error:", error?.message);
  }

  // No code provided OR exchange failed → Redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=auth_code_error", requestUrl.origin)
  );
}
