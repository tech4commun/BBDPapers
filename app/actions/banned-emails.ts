/**
 * Banned Email Management Actions
 * Server actions for managing permanently banned email addresses
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Check if an email is banned
 * Called during authentication flow
 */
export async function isEmailBanned(email: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("banned_emails")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();
    
    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for non-banned emails
      console.error("Error checking banned email:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Failed to check banned email:", error);
    return false;
  }
}

/**
 * Add email to banned list
 * Called when banning a user
 */
export async function banEmail(
  email: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    
    if (!profile?.is_admin) {
      return { success: false, error: "Admin access required" };
    }
    
    // Add to banned_emails table
    const { error: insertError } = await supabase
      .from("banned_emails")
      .insert({
        email: email.toLowerCase(),
        banned_by: user.id,
        reason: reason || "Banned by administrator",
      });
    
    if (insertError) {
      // Check if it's a duplicate key error (already banned)
      if (insertError.code === "23505") {
        return { success: true }; // Already banned, treat as success
      }
      console.error("Error banning email:", insertError);
      return { success: false, error: insertError.message };
    }
    
    console.log(`✅ Email banned: ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to ban email:", error);
    return { success: false, error: "Failed to ban email" };
  }
}

/**
 * Remove email from banned list
 * Called when unbanning a user
 */
export async function unbanEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    
    if (!profile?.is_admin) {
      return { success: false, error: "Admin access required" };
    }
    
    // Remove from banned_emails table
    const { error: deleteError } = await supabase
      .from("banned_emails")
      .delete()
      .eq("email", email.toLowerCase());
    
    if (deleteError) {
      console.error("Error unbanning email:", deleteError);
      return { success: false, error: deleteError.message };
    }
    
    console.log(`✅ Email unbanned: ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to unban email:", error);
    return { success: false, error: "Failed to unban email" };
  }
}

/**
 * Get all banned emails
 * For admin panel display
 */
export async function getBannedEmails(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    
    if (!profile?.is_admin) {
      return { success: false, error: "Admin access required" };
    }
    
    const { data, error } = await supabase
      .from("banned_emails")
      .select(`
        *,
        profiles:banned_by (
          full_name,
          email
        )
      `)
      .order("banned_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching banned emails:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch banned emails:", error);
    return { success: false, error: "Failed to fetch banned emails" };
  }
}
