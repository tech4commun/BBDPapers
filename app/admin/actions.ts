'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Helper to check Admin Status
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin === true;
}

// 2. Get Dashboard Statistics
export async function getStats(): Promise<
  | { totalNotes: number; pendingNotes: number; totalUsers: number; recentVisits: number }
  | { error: string }
> {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    // Calculate 24 hours ago timestamp
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Run all queries in parallel for speed
    const [
      { count: totalNotes },
      { count: pendingNotes },
      { count: totalUsers },
      { count: recentVisits }
    ] = await Promise.all([
      // Total notes count
      supabase
        .from('notes')
        .select('*', { count: 'exact', head: true }),
      
      // Pending approvals count
      supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false),
      
      // Total users count
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      
      // Recent visits (24h) count
      supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo.toISOString())
    ]);

    return {
      totalNotes: totalNotes || 0,
      pendingNotes: pendingNotes || 0,
      totalUsers: totalUsers || 0,
      recentVisits: recentVisits || 0
    };
  } catch (error: any) {
    console.error("Failed to fetch stats:", error.message);
    return { error: error.message || "Failed to fetch statistics" };
  }
}

// 3. Fetch Pending Content
export async function getPendingContent() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      console.log("🚫 Not admin");
      return { error: "Unauthorized" };
    }

    const supabase = await createClient();

    // First, try a simple query without joins to see if data exists
    console.log("📊 Fetching pending notes...");
    const { data: simpleData, error: simpleError } = await supabase
      .from('notes')
      .select('*')
      .eq('is_approved', false);

    console.log("Simple query result:", { 
      count: simpleData?.length || 0, 
      error: simpleError,
      data: simpleData 
    });

    if (simpleError) {
      console.error("❌ Simple query failed:", JSON.stringify(simpleError, null, 2));
      return { error: simpleError.message };
    }

    // If no data in simple query, return empty
    if (!simpleData || simpleData.length === 0) {
      console.log("✅ No pending notes found (empty table)");
      return { data: [] };
    }

    // Now try with profile join
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Join query failed:", JSON.stringify(error, null, 2));
      // Fallback: return simple data without profiles
      console.log("⚠️ Returning data without profiles");
      return { 
        data: simpleData.map(note => ({
          ...note,
          profiles: null
        }))
      };
    }

    console.log("✅ Successfully fetched with profiles:", data?.length);
    return { data };
  } catch (error: any) {
    console.error("💥 Server Action Exception:", error.message);
    return { error: error.message || "Failed to fetch pending content" };
  }
}

// 3. Approve Content (with Rename)
export async function approveNote(
  noteId: string, 
  updates: { title: string; subject: string; branch: string; semester: string }
) {
  const isAdmin = await checkAdmin(); // Helper we wrote earlier
  if (!isAdmin) return { error: "Unauthorized" };

  const supabase = await createClient();

  const { error } = await supabase
    .from('notes')
    .update({
      title: updates.title,
      subject: updates.subject,
      branch: updates.branch,
      semester: updates.semester,
      is_approved: true, // <--- The magic switch
      updated_at: new Date().toISOString()
    })
    .eq('id', noteId);

  if (error) return { error: error.message };

  revalidatePath('/admin/moderation');
  return { success: true };
}

// 4. Reject Content (Delete)
export async function rejectNote(noteId: string, filePath: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const supabase = await createClient();

  // Delete from Storage first
  const { error: storageError } = await supabase.storage
    .from('bbd_notes_files')
    .remove([filePath]);

  if (storageError) console.error("Storage Delete Error:", storageError);

  // Delete from DB
  const { error: dbError } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (dbError) return { error: dbError.message };

  revalidatePath('/admin/moderation');
  return { success: true };
}

// 5. Toggle User Ban Status
export async function toggleBan(userId: string) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = await createClient();

    // Get current ban status
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_banned: !profile.is_banned })
      .eq('id', userId);

    if (updateError) throw updateError;

    revalidatePath('/admin/users');
    return { 
      success: true,
      message: profile.is_banned ? "User unbanned" : "User banned"
    };
  } catch (error: any) {
    console.error("Failed to toggle ban:", error.message);
    return { error: error.message || "Failed to update user status" };
  }
}

// 6. Generate Signed URL for Secure File Access (Admin Only)
export async function getSignedUrl(filePath: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { error: "Unauthorized", url: null };

  const supabase = await createClient();

  console.log("🔐 Generating signed URL for path:", filePath);

  // First check if file exists
  const { data: fileList, error: listError } = await supabase.storage
    .from('bbd_notes_files')
    .list(filePath.split('/').slice(0, -1).join('/'), {
      search: filePath.split('/').pop()
    });

  if (listError) {
    console.error("❌ List error:", listError);
    return { error: `Failed to check file: ${listError.message}`, url: null };
  }

  if (!fileList || fileList.length === 0) {
    console.error("❌ File not found in storage:", filePath);
    return { error: "File not found in storage. It may have been deleted.", url: null };
  }

  console.log("✅ File exists, generating signed URL...");

  // Generate signed URL (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from('bbd_notes_files')
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error("❌ Signed URL error:", error);
    return { error: error.message, url: null };
  }
  
  console.log("✅ Signed URL generated successfully");
  return { error: null, url: data.signedUrl };
}

// 7. List All Files in Storage (Admin Only)
export async function listAllFiles() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { error: "Unauthorized", files: [] };

  const supabase = await createClient();

  try {
    console.log("📂 Listing all storage files...");
    
    // List all folders in pending
    const { data: folders, error: folderError } = await supabase.storage
      .from('bbd_notes_files')
      .list('pending', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (folderError) {
      console.error("❌ List folders error:", folderError);
      return { error: folderError.message, files: [] };
    }

    console.log("📁 Found folders:", folders?.length || 0);

    const allFiles = [];
    
    // Get files from each user folder
    for (const folder of folders || []) {
      // Only process actual folders (they have no extension)
      if (!folder.name.includes('.')) {
        console.log(`📂 Checking folder: pending/${folder.name}`);
        
        const { data: userFiles, error: filesError } = await supabase.storage
          .from('bbd_notes_files')
          .list(`pending/${folder.name}`, {
            limit: 1000,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (filesError) {
          console.error(`❌ Error listing files in ${folder.name}:`, filesError);
          continue;
        }

        console.log(`  └─ Files found: ${userFiles?.length || 0}`);

        if (userFiles) {
          for (const file of userFiles) {
            // Only add actual files (with .pdf extension)
            if (file.name.endsWith('.pdf')) {
              allFiles.push({
                name: file.name,
                path: `pending/${folder.name}/${file.name}`,
                size: file.metadata?.size || 0,
                created_at: file.created_at || new Date().toISOString(),
                userId: folder.name
              });
            }
          }
        }
      }
    }

    console.log("✅ Total files listed:", allFiles.length);
    
    // Get database records for these files to include metadata
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .in('file_path', allFiles.map(f => f.path));

    // Merge storage and database data
    const filesWithMetadata = allFiles.map(file => {
      const note = notes?.find(n => n.file_path === file.path);
      return {
        ...file,
        noteId: note?.id || null,
        title: note?.title || file.name,
        subject: note?.subject || 'Unknown',
        branch: note?.branch || null,
        semester: note?.semester || null,
        is_approved: note?.is_approved || false
      };
    });

    return { error: null, files: filesWithMetadata };
  } catch (error: any) {
    console.error("💥 List files exception:", error);
    return { error: error.message, files: [] };
  }
}

// 8. Delete File from Storage (Admin Only)
export async function deleteFile(filePath: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { error: "Unauthorized", success: false };

  const supabase = await createClient();

  try {
    console.log("🗑️ Deleting file:", filePath);

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('bbd_notes_files')
      .remove([filePath]);

    if (storageError) {
      console.error("❌ Storage delete error:", storageError);
      return { error: storageError.message, success: false };
    }

    // Also delete from database if it exists
    const { error: dbError } = await supabase
      .from('notes')
      .delete()
      .eq('file_path', filePath);

    if (dbError) {
      console.warn("⚠️ Database delete warning:", dbError);
      // Don't fail if DB delete fails, storage delete succeeded
    }

    console.log("✅ File deleted successfully");
    return { error: null, success: true };
  } catch (error: any) {
    console.error("💥 Delete file exception:", error);
    return { error: error.message, success: false };
  }
}

// 9. Replace File in Storage (Admin Only)
export async function replaceFile(oldFilePath: string, newFile: File) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { error: "Unauthorized", success: false };

  const supabase = await createClient();

  try {
    console.log("🔄 Replacing file:", oldFilePath);

    // 1. Delete old file
    const { error: deleteError } = await supabase.storage
      .from('bbd_notes_files')
      .remove([oldFilePath]);

    if (deleteError) {
      console.error("❌ Delete old file error:", deleteError);
      return { error: deleteError.message, success: false };
    }

    // 2. Upload new file with same path
    const { error: uploadError } = await supabase.storage
      .from('bbd_notes_files')
      .upload(oldFilePath, newFile);

    if (uploadError) {
      console.error("❌ Upload new file error:", uploadError);
      return { error: uploadError.message, success: false };
    }

    // 3. Update database record size
    const { error: dbError } = await supabase
      .from('notes')
      .update({ 
        size: newFile.size,
        updated_at: new Date().toISOString()
      })
      .eq('file_path', oldFilePath);

    if (dbError) {
      console.warn("⚠️ Database update warning:", dbError);
      // Don't fail if DB update fails, file replacement succeeded
    }

    console.log("✅ File replaced successfully");
    return { error: null, success: true };
  } catch (error: any) {
    console.error("💥 Replace file exception:", error);
    return { error: error.message, success: false };
  }
}

// 10. Update Note Metadata (Admin Only)
export async function updateNoteMetadata(
  noteId: string,
  updates: {
    title: string;
    subject: string;
    branch: string;
    semester: string;
  }
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { error: "Unauthorized", success: false };

  const supabase = await createClient();

  try {
    console.log("✏️ Updating note metadata:", noteId, updates);

    const { error } = await supabase
      .from('notes')
      .update({
        title: updates.title,
        subject: updates.subject,
        branch: updates.branch,
        semester: updates.semester,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId);

    if (error) {
      console.error("❌ Update error:", error);
      return { error: error.message, success: false };
    }

    console.log("✅ Metadata updated successfully");
    revalidatePath('/admin/files');
    revalidatePath('/admin/moderation');
    revalidatePath('/explore');
    return { error: null, success: true };
  } catch (error: any) {
    console.error("💥 Update metadata exception:", error);
    return { error: error.message, success: false };
  }
}