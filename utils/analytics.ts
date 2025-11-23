/**
 * Analytics Logging Utility
 * Tracks page visits with IP, User Agent, and User ID
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

/**
 * Log Page Visit
 * Records visitor data to analytics table
 * 
 * @param pageName - Name of the page being visited (e.g., "home", "explore", "upload")
 */
export async function logVisit(pageName: string) {
  const supabase = await createClient();
  const headersList = await headers();

  try {
    // Get user (may be null for guests)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Extract IP and User Agent from headers
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";

    const userAgent = headersList.get("user-agent") || "unknown";

    // Insert analytics record
    const { error } = await supabase.from("analytics").insert({
      page_name: pageName,
      ip_address: ipAddress,
      user_agent: userAgent,
      user_id: user?.id || null,
      visited_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log visit:", error);
    }
  } catch (error) {
    // Fail silently - analytics shouldn't break the page
    console.error("Analytics logging error:", error);
  }
}
