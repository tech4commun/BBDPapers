/**
 * Login Server Actions
 * Handles authentication flows on the server (secure, no token exposure)
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Initiates Google OAuth login flow
 * Forces consent screen for improved security awareness
 * Accepts optional nextUrl to preserve redirect destination with query params
 */
export async function loginWithGoogle(nextUrl?: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  // Build callback URL with next param if provided
  const callbackUrl = nextUrl
    ? `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`
    : `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent", // Forces account selection screen every time
      },
    },
  });

  if (error) {
    console.error("Google OAuth error:", error.message);
    return { url: null, error: error.message };
  }

  return { url: data.url, error: null };
}

/**
 * Initiates GitHub OAuth login flow
 * Uses redirect() for immediate navigation to OAuth provider
 * Accepts optional nextUrl to preserve redirect destination with query params
 * 
 * Note: GitHub doesn't support 'prompt: consent' like Google,
 * but secure redirectTo ensures clean authentication flow
 */
export async function loginWithGitHub(nextUrl?: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  // Build callback URL with next param if provided
  const callbackUrl = nextUrl
    ? `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`
    : `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: callbackUrl,
      scopes: "read:user user:email", // Explicitly request minimal necessary scopes
    },
  });

  if (error) {
    console.error("GitHub OAuth error:", error.message);
    redirect("/login?error=github_auth_error");
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Sends magic link email for passwordless login
 * Accepts optional nextUrl to preserve redirect destination with query params
 */
export async function loginWithMagicLink(email: string, nextUrl?: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  // Build callback URL with next param if provided
  const callbackUrl = nextUrl
    ? `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`
    : `${origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    console.error("Magic link error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Signs out the current user and clears server-side session
 * Deletes HttpOnly cookies and revalidates cache to update UI immediately
 * Forces redirect to login page to ensure clean state
 */
export async function signOut() {
  const supabase = await createClient();

  // 1. Check if user exists first (optional but safe)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // 2. Sign out on the server (Deletes the HttpOnly cookie)
    await supabase.auth.signOut();
  }

  // 3. Clear Next.js Cache so the Navbar updates immediately
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/", "layout");

  // 4. Force Redirect to Login
  redirect("/login");
}
