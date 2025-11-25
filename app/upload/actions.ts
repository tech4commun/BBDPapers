"use server";

import { createClient } from "@/utils/supabase/server";

interface SaveNoteData {
  file: File;
  fileName: string;
  type: "notes" | "pyq";
  title: string;
  branch: string;
  semester: string;
  subject: string;
  fileHash: string; // SHA-256 hash for duplicate detection
}

export async function saveNoteToDB(data: SaveNoteData) {
  const supabase = await createClient();

  try {
    console.log("🔧 saveNoteToDB called with:", {
      fileName: data.fileName,
      type: data.type,
      title: data.title,
      branch: data.branch,
      semester: data.semester,
      subject: data.subject,
      fileHash: data.fileHash.substring(0, 16) + '...' // Log partial hash for security
    });
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("👤 Current user:", user?.email, user?.id);

    if (!user) {
      console.error("❌ No user found");
      return { success: false, error: "User not authenticated. Please log in." };
    }

    // Check for duplicate file using hash (secure - hash is not reversible)
    console.log("🔍 Checking for duplicate files...");
    const { data: existingFiles, error: checkError } = await supabase
      .from('notes')
      .select('id, title, file_hash')
      .eq('file_hash', data.fileHash)
      .limit(1);

    if (checkError) {
      console.error("❌ Error checking duplicates:", checkError);
      // Continue with upload even if check fails
    } else if (existingFiles && existingFiles.length > 0) {
      console.log("⚠️ Duplicate file detected:", existingFiles[0].title);
      return { 
        success: false, 
        error: "This file has already been uploaded. Duplicate files are not allowed." 
      };
    }

    console.log("✅ No duplicates found, proceeding with upload...");

    // 1. Upload to Storage (server-side)
    console.log("☁️ Uploading to storage...");
    const path = `pending/${user.id}/${crypto.randomUUID()}.pdf`;
    const { error: storageError } = await supabase.storage
      .from('bbd_notes_files')
      .upload(path, data.file);

    if (storageError) {
      console.error("❌ Storage error:", storageError);
      return { success: false, error: `Storage upload failed: ${storageError.message}` };
    }
    console.log("✅ File uploaded to storage:", path);

    // 2. Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from("bbd_notes_files")
      .getPublicUrl(path);

    console.log("🔗 Public URL:", urlData.publicUrl);

    // 3. Insert into database with user-provided metadata
    const insertData = {
      title: data.title, // User-provided title
      subject: data.subject, // User-provided subject
      type: data.type,
      file_url: urlData.publicUrl,
      file_path: path,
      file_hash: data.fileHash, // Store hash for duplicate detection
      size: data.file.size,
      user_id: user.id,
      is_approved: false, // Still needs admin approval
      branch: data.branch, // User-provided branch
      semester: data.semester, // User-provided semester
    };

    console.log("📝 Inserting into notes table:", insertData);

    const { data: insertedData, error: dbError } = await supabase
      .from("notes")
      .insert(insertData)
      .select();

    if (dbError) {
      console.error("❌ Database insert error:", dbError);
      return { success: false, error: dbError.message };
    }

    console.log("✅ Successfully inserted:", insertedData);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("💥 Exception in saveNoteToDB:", error);
    return { success: false, error: error.message || "Failed to save note" };
  }
}
