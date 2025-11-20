"use server";

// Mock database - Replace with actual Supabase/Prisma queries
const mockNotesDatabase = [
  { id: "1", title: "Engineering Math-I Notes", type: "notes", subject: "Engineering Math-I", semester: "1", branch: "CSE" },
  { id: "2", title: "C Programming Complete Guide", type: "notes", subject: "C Programming", semester: "1", branch: "CSE" },
  { id: "3", title: "Engineering Physics PYQ 2023", type: "pyq", subject: "Engineering Physics", semester: "1", branch: "CSE" },
  { id: "4", title: "Data Structures Notes", type: "notes", subject: "Data Structures (C)", semester: "2", branch: "CSE" },
  { id: "5", title: "DBMS Complete Notes", type: "notes", subject: "Database Management Systems", semester: "5", branch: "CSE" },
  { id: "6", title: "Operating Systems PYQ 2023", type: "pyq", subject: "Operating Systems", semester: "4", branch: "CSE" },
  { id: "7", title: "Java Programming Notes", type: "notes", subject: "Object Oriented Prog (Java)", semester: "3", branch: "CSE" },
  { id: "8", title: "Computer Networks Guide", type: "notes", subject: "Computer Networks", semester: "6", branch: "CSE" },
  { id: "9", title: "Algorithms Analysis Notes", type: "notes", subject: "Design & Analysis of Algorithms", semester: "5", branch: "CSE" },
  { id: "10", title: "AI Complete Notes", type: "notes", subject: "Artificial Intelligence", semester: "7", branch: "CSE" },
  { id: "11", title: "Thermodynamics Notes", type: "notes", subject: "Thermodynamics", semester: "3", branch: "ME" },
  { id: "12", title: "Fluid Mechanics PYQ 2022", type: "pyq", subject: "Fluid Mechanics", semester: "3", branch: "ME" },
  { id: "13", title: "Python Programming Guide", type: "notes", subject: "Python Programming", semester: "1", branch: "BCA" },
  { id: "14", title: "Web Development Complete", type: "notes", subject: "Web Technology", semester: "5", branch: "CSE" },
  { id: "15", title: "Compiler Design Notes", type: "notes", subject: "Compiler Design", semester: "6", branch: "CSE" },
];

export interface SearchSuggestion {
  id: string;
  title: string;
  type: "notes" | "pyq";
  subject: string;
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  // Validation: minimum 2 characters
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Security: limit query length to prevent abuse
  const sanitizedQuery = query.trim().slice(0, 100).toLowerCase();

  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock database search using case-insensitive matching (simulating ilike)
    const results = mockNotesDatabase
      .filter(item => 
        item.title.toLowerCase().includes(sanitizedQuery) ||
        item.subject.toLowerCase().includes(sanitizedQuery)
      )
      .slice(0, 5) // Limit to exactly 5 results
      .map(item => ({
        id: item.id,
        title: item.title,
        type: item.type as "notes" | "pyq",
        subject: item.subject,
      }));

    return results;

    /* 
    // Real Supabase implementation:
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, type, subject')
      .ilike('title', `%${sanitizedQuery}%`)
      .limit(5);

    if (error) throw error;
    return data || [];
    */
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
