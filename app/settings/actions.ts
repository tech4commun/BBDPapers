"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Update user avatar
 * Updates both profiles table and auth metadata
 * CRITICAL: Revalidates layout to update Navbar immediately
 */
export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // 1. Update profiles table
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (dbError) {
      console.error("Database avatar update error:", dbError);
      return { success: false, error: dbError.message };
    }

    // 2. Update auth metadata (for immediate navbar refresh)
    const { error: authError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });

    if (authError) {
      console.error("Auth metadata update error:", authError);
      // Don't fail completely if metadata update fails
    }

    // 3. CRUCIAL: Force layout revalidation (updates Navbar)
    revalidatePath("/", "layout");
    revalidatePath("/settings");

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Unexpected avatar update error:", error);
    return { success: false, error: error.message || "Failed to update avatar" };
  }
}

/**
 * Update complete profile settings
 * Updates avatar, course, branch, semester, passout year
 */
export async function updateProfileSettings(data: {
  avatar_url: string;
  course: string;
  branch: string;
  semester: number;
  passout_year: number;
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Update profiles table
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        avatar_url: data.avatar_url,
        course: data.course,
        branch: data.branch,
        semester: data.semester,
        passout_year: data.passout_year,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (dbError) {
      console.error("Profile update error:", dbError);
      return { success: false, error: dbError.message };
    }

    // Update auth metadata for avatar
    const { error: authError } = await supabase.auth.updateUser({
      data: { avatar_url: data.avatar_url },
    });

    if (authError) {
      console.error("Auth metadata update error:", authError);
    }

    // Revalidate to update UI immediately
    revalidatePath("/", "layout");
    revalidatePath("/settings");

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Unexpected profile update error:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}
