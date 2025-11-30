"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ArrowLeft, FileText, BookOpen, Filter, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  subject: string;
  course: string;
  branch: string;
  semester: string;
  type: "notes" | "pyq";
  file_url: string;
  file_path: string;
  size: number;
  created_at: string;
  uploader_name: string | null;
  // PYQ-specific fields
  exam_type?: string;
  academic_year?: string;
  semester_type?: string;
}

interface StoredData {
  results: SearchResult[];
  filters: {
    type: string;
    branch: string;
    semester: string;
    subject: string;
  };
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<StoredData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const supabase = createClient();

  // Generate signed download URLs for all results
  useEffect(() => {
    if (!data?.results) return;
    
    const generateUrls = async () => {
      const urls: Record<string, string> = {};
      
      for (const result of data.results) {
        const { data: urlData } = await supabase.storage
          .from('bbd_notes_files')
          .createSignedUrl(result.file_path, 3600);
        
        if (urlData?.signedUrl) {
          urls[result.id] = urlData.signedUrl;
        }
      }
      
      setDownloadUrls(urls);
    };
    
    generateUrls();
  }, [data, supabase]);

  useEffect(() => {
    // Retrieve results from sessionStorage
    const stored = sessionStorage.getItem('search_results');
    
    if (!stored) {
      toast.error("No search results found. Please search again.");
      router.push('/explore');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setData(parsed);
    } catch (error) {
      console.error("Failed to parse search results:", error);
      toast.error("Failed to load results.");
      router.push('/explore');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { results, filters } = data;

  return (
    <div className="min-h-screen px-4 md:px-6 py-12 pt-32">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Search Results
              </h1>
              <p className="text-slate-400">
                Found {results.length} {filters.type === "pyq" ? "Previous Year Paper" : "Lecture Note"}{results.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Filter Summary */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              <div className="text-sm">
                <span className="text-slate-400">Filters: </span>
                <span className="text-white font-medium">
                  {filters.branch} • {filters.semester} • {filters.subject}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          {results.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-slate-800/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                <div className="flex-1 min-w-0">
                  {/* Type Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    {note.type === "pyq" ? (
                      <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                        <FileText className="w-3 h-3" />
                        PYQ
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                        <BookOpen className="w-3 h-3" />
                        NOTES
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                    {note.title}
                  </h3>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    {note.uploader_name && (
                      <span className="bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        Uploaded by: {note.uploader_name}
                      </span>
                    )}
                    <span className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-full">
                      {note.subject}
                    </span>
                    {note.course && note.course !== 'N/A' && (
                      <span className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-full">
                        {note.course}
                      </span>
                    )}
                    {note.branch && note.branch !== 'N/A' && (
                      <span className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-full">
                        {note.branch}
                      </span>
                    )}
                    {note.semester && note.semester !== 'N/A' && (
                      <span className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-full">
                        {note.semester}
                      </span>
                    )}
                    {/* PYQ-specific metadata */}
                    {note.type === 'pyq' && note.exam_type && (
                      <span className="bg-purple-500/10 text-purple-300 px-3 py-1.5 rounded-full capitalize">
                        {note.exam_type}
                      </span>
                    )}
                    {note.type === 'pyq' && note.academic_year && (
                      <span className="bg-purple-500/10 text-purple-300 px-3 py-1.5 rounded-full">
                        AY: {note.academic_year}
                      </span>
                    )}
                    {note.type === 'pyq' && note.semester_type && (
                      <span className="bg-purple-500/10 text-purple-300 px-3 py-1.5 rounded-full capitalize">
                        {note.semester_type} Sem
                      </span>
                    )}
                    <span className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-full">
                      {(note.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                {/* Download Button */}
                <a
                  href={downloadUrls[note.id] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => toast.success("Opening file...")}
                  className="shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-indigo-500/50 hover:scale-105 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State - Just in case */}
        {results.length === 0 && (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your filters or search criteria.
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
            >
              New Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
