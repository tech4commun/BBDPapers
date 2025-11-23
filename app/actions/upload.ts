"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface SaveUploadData {
  title: string;
  subject: string;
  semester: number;
  branch: string;
  course: string;
  file_url: string;
  file_path: string;
  resource_type: "pyq" | "notes";
}

/**
 * Saves uploaded file metadata to database
 * Marks as pending approval for admin review
 */
export async function saveUploadToDB(data: SaveUploadData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Insert into notes table (adjust table name as needed)
  const { error } = await supabase.from("notes").insert({
    title: data.title,
    subject: data.subject,
    semester: data.semester,
    branch: data.branch,
    course: data.course,
    file_url: data.file_url,
    file_path: data.file_path,
    resource_type: data.resource_type,
    uploaded_by: user.id,
    status: "pending", // Requires admin approval
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Database insert error:", error);
    return { success: false, error: error.message };
  }

  // Revalidate to update UI
  revalidatePath("/admin/moderation");

  return { success: true, error: null };
}
