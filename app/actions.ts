"use server";

import { createClient } from '@/utils/supabase/server';

export interface SearchSuggestion {
  id: string;
  title: string;
  type: "notes" | "pyq";
  subject: string;
  file_path: string;
  uploader_name: string | null;
  course: string;
  branch: string;
  semester: string;
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  // Validation: minimum 2 characters
  if (!query || query.trim().length < 2) {
    console.log('⏸️ Backend: Query too short:', query);
    return [];
  }

  // Security: limit query length to prevent abuse
  const sanitizedQuery = query.trim().slice(0, 100);

  try {
    const supabase = await createClient();

    console.log('🔍 Backend: Searching for:', sanitizedQuery);

    // Search approved notes only by subject (not title or branch)
    const { data, error } = await supabase
      .from('notes')
      .select(`
        id,
        title,
        type,
        subject,
        file_path,
        course,
        branch,
        semester,
        profiles (
          full_name,
          email
        )
      `)
      .eq('is_approved', true)
      .neq('subject', 'Pending Review')
      .ilike('subject', `%${sanitizedQuery}%`) // Only search subject field
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Backend search error:', error);
      throw error;
    }

    console.log('📦 Backend: Raw results from DB:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📋 Backend: First result details:', {
        subject: data[0].subject,
        course: data[0].course,
        branch: data[0].branch,
        semester: data[0].semester,
        type: data[0].type
      });
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Backend: No results found for:', sanitizedQuery);
      return [];
    }

    // Group by subject, type, course, branch, semester to show unique combinations
    const resultMap = new Map<string, any>();

    data.forEach(item => {
      const subject = item.subject;
      const type = item.type;
      const course = item.course || 'N/A';
      const branch = item.branch || 'N/A';
      const semester = item.semester || 'N/A';
      const key = `${subject}_${type}_${course}_${branch}_${semester}`;

      // Store first occurrence of each unique combination
      if (!resultMap.has(key)) {
        resultMap.set(key, item);
      }
    });

    console.log('🗂️ Backend: After grouping:', resultMap.size, 'unique combinations');

    // Transform data to extract uploader name
    const suggestions = Array.from(resultMap.values()).map((item: any) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      subject: item.subject,
      file_path: item.file_path,
      uploader_name: item.profiles?.full_name || item.profiles?.email?.split('@')[0] || null,
      course: item.course || 'N/A',
      branch: item.branch || 'N/A',
      semester: item.semester || 'N/A'
    }));

    // Sort: PYQ first, then Notes, then alphabetically by subject
    suggestions.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'pyq' ? -1 : 1;
      }
      return a.subject.localeCompare(b.subject);
    });

    console.log('✅ Backend: Returning', suggestions.length, 'suggestions');
    return suggestions.slice(0, 10);
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
