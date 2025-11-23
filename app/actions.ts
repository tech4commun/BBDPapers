"use server";

import { createClient } from '@/utils/supabase/server';

export interface SearchSuggestion {
  id: string;
  title: string;
  type: "notes" | "pyq";
  subject: string;
  file_path: string;
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  // Validation: minimum 2 characters
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Security: limit query length to prevent abuse
  const sanitizedQuery = query.trim().slice(0, 100);

  try {
    const supabase = await createClient();

    // Search approved notes only by title, subject, or branch
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, type, subject, file_path')
      .eq('is_approved', true)
      .neq('subject', 'Pending Review')
      .or(`title.ilike.%${sanitizedQuery}%,subject.ilike.%${sanitizedQuery}%,branch.ilike.%${sanitizedQuery}%`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Search error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("❌ Search failed:", error);
    return [];
  }
}

export async function getDownloadUrl(filePath: string): Promise<{ url: string | null; error?: string }> {
  try {
    const supabase = await createClient();

    // Generate signed URL (1 hour expiry)
    const { data, error } = await supabase.storage
      .from('bbd_notes_files')
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('❌ Failed to generate download URL:', error);
      return { url: null, error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error) {
    console.error('❌ Download URL generation failed:', error);
    return { url: null, error: 'Failed to generate download link' };
  }
}
