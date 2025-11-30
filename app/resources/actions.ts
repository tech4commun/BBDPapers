"use server";

import { createClient } from "@/utils/supabase/server";

interface SearchParams {
  type: "notes" | "pyq";
  branch: string;
  semester: string;
  subject: string;
}

export async function searchResources(params: SearchParams) {
  const supabase = await createClient();

  try {
    console.log("🔍 Searching resources:", params);

    let query = supabase
      .from('notes')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .eq('is_approved', true)
      .eq('type', params.type);

    if (params.branch) {
      query = query.eq('branch', params.branch);
    }

    if (params.semester) {
      query = query.eq('semester', params.semester);
    }

    if (params.subject) {
      query = query.ilike('subject', `%${params.subject}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Search error:", error);
      return { error: error.message, results: [] };
    }

    // Transform data to include uploader_name and all fields including PYQ fields
    const results = data?.map(item => ({
      ...item,
      uploader_name: item.profiles?.full_name || item.profiles?.email?.split('@')[0] || null
    })) || [];

    console.log("✅ Found resources:", results.length);
    return { error: null, results };
  } catch (error: any) {
    console.error("💥 Search exception:", error);
    return { error: error.message, results: [] };
  }
}
