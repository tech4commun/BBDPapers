"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, ArrowLeft, FileText, BookOpen, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface FileResult {
  id: string;
  title: string;
  subject: string;
  branch: string;
  semester: string;
  course: string;
  type: "notes" | "pyq";
  file_url: string;
  file_path: string;
  size: number;
  created_at: string;
  uploader_name: string | null;
  exam_type?: string;
  academic_year?: string;
  semester_type?: string;
}

interface GroupedFiles {
  [key: string]: FileResult[];
}

export default function SubjectResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const subject = searchParams.get("subject") || "";
  const [files, setFiles] = useState<FileResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate fresh download URL from file_path
  const getDownloadUrl = (filePath: string) => {
    const { data: urlData } = supabase.storage
      .from('bbd_notes_files')
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  useEffect(() => {
    async function fetchSubjectFiles() {
      if (!subject) {
        toast.error("No subject specified");
        router.push("/explore");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notes')
          .select(`
            *,
            profiles (
              full_name,
              email
            )
          `)
          .eq('is_approved', true)
          .eq('subject', subject)
          .order('type', { ascending: false }) // PYQ first
          .order('created_at', { ascending: false });

        if (error) throw error;

        const enriched = data?.map(item => ({
          ...item,
          uploader_name: item.profiles?.full_name || item.profiles?.email?.split('@')[0] || null
        })) || [];

        setFiles(enriched);
      } catch (error: any) {
        console.error("Failed to fetch files:", error);
        toast.error("Failed to load files");
      } finally {
        setLoading(false);
      }
    }

    fetchSubjectFiles();
  }, [subject, supabase, router]);

  // Group files by course, branch, semester, and type
  const groupedFiles: GroupedFiles = files.reduce((acc, file) => {
    const key = `${file.course}|${file.branch}|${file.semester}|${file.type}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(file);
    return acc;
  }, {} as GroupedFiles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-6 py-12 pt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
                {subject}
              </h1>
              <p className="text-slate-400">
                Found {files.length} resource{files.length !== 1 ? 's' : ''} across different courses and semesters
              </p>
            </div>
          </div>
        </div>

        {/* Grouped Results */}
        {Object.keys(groupedFiles).length === 0 ? (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Files Found</h3>
            <p className="text-slate-400 mb-6">
              No files available for this subject yet.
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
            >
              Explore Other Resources
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedFiles).map(([key, groupFiles], groupIndex) => {
              const [course, branch, semester, type] = key.split('|');
              const Icon = type === 'pyq' ? FileText : BookOpen;
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="px-6 py-4 bg-slate-800/30 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h3 className="font-semibold text-white">
                          {course} - {branch}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {semester} • {type === 'pyq' ? 'Previous Year Papers' : 'Lecture Notes'} ({groupFiles.length})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Files in Group */}
                  <div className="divide-y divide-white/5">
                    {groupFiles.map((file, fileIndex) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (groupIndex * 0.1) + (fileIndex * 0.05) }}
                        className="p-6 hover:bg-slate-800/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h4 className="text-lg font-semibold text-white mb-2">
                              {file.title}
                            </h4>

                            {/* Metadata Chips */}
                            <div className="flex flex-wrap gap-2 text-sm">
                              {file.uploader_name && (
                                <span className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                                  <User className="w-3 h-3" />
                                  {file.uploader_name}
                                </span>
                              )}
                              
                              {/* PYQ-specific fields */}
                              {file.type === 'pyq' && file.exam_type && (
                                <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full capitalize">
                                  {file.exam_type}
                                </span>
                              )}
                              {file.type === 'pyq' && file.academic_year && (
                                <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full">
                                  AY: {file.academic_year}
                                </span>
                              )}
                              {file.type === 'pyq' && file.semester_type && (
                                <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full capitalize">
                                  {file.semester_type} Sem
                                </span>
                              )}

                              <span className="bg-white/5 text-slate-300 px-3 py-1 rounded-full">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              
                              <span className="bg-white/5 text-slate-300 px-3 py-1 rounded-full text-xs">
                                {new Date(file.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Download Button */}
                          <a
                            href={getDownloadUrl(file.file_path)}
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
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
