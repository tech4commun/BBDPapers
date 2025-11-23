/**
 * Browser-side Supabase Client
 * Uses @supabase/ssr for secure cookie management (Client Components only)
 * 
 * Security: Reads session from httpOnly cookies automatically
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
