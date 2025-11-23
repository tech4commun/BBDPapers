"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface UpdateProfileData {
  course: string;
  branch: string;
  semester: number;
  passout_year: number;
}

interface UpdateProfileSettingsData {
  avatar_url: string;
  course: string;
  branch: string;
  semester: number;
  passout_year: number;
}

/**
 * Updates user profile with academic details
 * Called when user completes onboarding or updates profile
 */
export async function updateProfile(data: UpdateProfileData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Update profile in database
  const { error } = await supabase
    .from("profiles")
    .update({
      course: data.course,
      branch: data.branch,
      semester: data.semester,
      passout_year: data.passout_year,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error);
    return { success: false, error: error.message };
  }

  // Revalidate to update UI immediately
  revalidatePath("/", "layout");

  return { success: true, error: null };
}

/**
 * Updates user profile settings including avatar
 * Called from settings page
 */
export async function updateProfileSettings(data: UpdateProfileSettingsData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Update profile in database
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

  // Update user metadata in auth
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      avatar_url: data.avatar_url,
    },
  });

  if (authError) {
    console.error("Auth metadata update error:", authError);
    // Don't fail completely if metadata update fails
  }

  // Revalidate to update UI immediately
  revalidatePath("/", "layout");
  revalidatePath("/settings");

  return { success: true, error: null };
}
