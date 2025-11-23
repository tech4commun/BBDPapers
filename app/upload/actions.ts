"use server";

import { createClient } from "@/utils/supabase/server";

interface SaveNoteData {
  file: File;
  fileName: string;
  type: "notes" | "pyq";
}

export async function saveNoteToDB(data: SaveNoteData) {
  const supabase = await createClient();

  try {
    console.log("🔧 saveNoteToDB called with file:", data.fileName, "type:", data.type);
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("👤 Current user:", user?.email, user?.id);

    if (!user) {
      console.error("❌ No user found");
      return { success: false, error: "User not authenticated. Please log in." };
    }

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

    // 3. Insert into database
    const insertData = {
      title: data.fileName,
      subject: "Pending Review",
      type: data.type,
      file_url: urlData.publicUrl,
      file_path: path,
      size: data.file.size,
      user_id: user.id,
      is_approved: false,
      branch: null,
      semester: null,
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
