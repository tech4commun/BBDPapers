'use client';

import { useState, useRef } from 'react';
import { FileText, Trash2, Clock, User, ExternalLink, Upload, Edit, Search, X, Info, BookOpen } from 'lucide-react';
import { deleteFile, getSignedUrl, replaceFile, updateNoteMetadata } from '../actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import EditMetadataModal from '@/app/admin/files/EditMetadataModal';

interface FileItem {
  name: string;
  path: string;
  size: number;
  created_at: string;
  userId: string;
  noteId: string | null;
  title: string;
  subject: string;
  course: string | null;
  branch: string | null;
  semester: string | null;
  type: 'notes' | 'pyq';
  exam_type: string | null;
  academic_year: string | null;
  semester_type: string | null;
  is_approved: boolean;
}

export default function FileManagerClient({ files }: { files: FileItem[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsFile, setDetailsFile] = useState<FileItem | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const router = useRouter();

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (file.branch && file.branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (file.semester && file.semester.toLowerCase().includes(searchQuery.toLowerCase())) ||
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = async (filePath: string) => {
    try {
      toast.info("Generating preview link...");
      const result = await getSignedUrl(filePath);
      
      if (result.error || !result.url) {
        throw new Error(result.error || "Failed to generate preview");
      }
      
      window.open(result.url, '_blank');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (filePath: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;

    setIsDeleting(filePath);
    try {
      const result = await deleteFile(filePath);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success("File deleted successfully");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleReplaceClick = (filePath: string) => {
    fileInputRefs.current[filePath]?.click();
  };

  const handleFileSelect = async (filePath: string, fileName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!confirm(`Replace "${fileName}" with "${file.name}"?`)) {
      event.target.value = '';
      return;
    }

    setIsReplacing(filePath);
    try {
      const result = await replaceFile(filePath, file);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success("File replaced successfully");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsReplacing(null);
      event.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
    {/* Search Bar */}
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, subject, branch, semester, or filename..."
          className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {searchQuery && (
        <p className="mt-2 text-sm text-slate-400">
          Found {filteredFiles.length} of {files.length} files
        </p>
      )}
    </div>

    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                File / Title
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  {searchQuery ? `No files match "${searchQuery}"` : "No files found"}
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) =>
              <tr key={file.path} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`relative w-11 h-11 rounded-lg flex items-center justify-center ${
                      file.type === 'pyq' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                    }`}>
                      {file.type === 'pyq' ? (
                        <FileText className="w-6 h-6 text-blue-400" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-emerald-400" />
                      )}
                      <span className={`absolute bottom-0.5 text-[8px] font-bold uppercase tracking-tight ${
                        file.type === 'pyq' ? 'text-blue-400' : 'text-emerald-400'
                      }`}>
                        {file.type === 'pyq' ? 'PYQ' : 'Notes'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.title}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-slate-300">
                  {file.subject}
                </td>
                <td className="px-3 py-3 text-sm text-slate-300">
                  {file.branch || '-'}
                </td>
                <td className="px-3 py-3 text-sm text-slate-300">
                  {file.semester || '-'}
                </td>
                <td className="px-3 py-3">
                  {file.is_approved ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="application/pdf"
                      ref={(el) => { fileInputRefs.current[file.path] = el; }}
                      onChange={(e) => handleFileSelect(file.path, file.name, e)}
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => setDetailsFile(file)}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                      title="View Full Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handlePreview(file.path)}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                      title="Preview"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    {file.noteId && (
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        title="Edit Metadata"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleReplaceClick(file.path)}
                      disabled={isReplacing === file.path}
                      className="p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isReplacing === file.path ? 'Replacing...' : 'Replace File'}
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(file.path, file.name)}
                      disabled={isDeleting === file.path}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isDeleting === file.path ? 'Deleting...' : 'Delete File'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
      
    {/* Edit Metadata Modal - Moved outside table container */}
    {selectedFile && selectedFile.noteId && (
      <EditMetadataModal
        noteId={selectedFile.noteId}
        currentData={{
          title: selectedFile.title,
          subject: selectedFile.subject,
          course: selectedFile.course || 'B.Tech',
          branch: selectedFile.branch || 'CSE',
          semester: selectedFile.semester || 'Semester 1',
          type: selectedFile.type,
          exam_type: selectedFile.exam_type || undefined,
          academic_year: selectedFile.academic_year || undefined,
          semester_type: selectedFile.semester_type || undefined
        }}
        onClose={() => {
          setSelectedFile(null);
          router.refresh();
        }}
      />
    )}

    {/* File Details Modal */}
    {detailsFile && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">File Details</h2>
              <p className="text-sm text-slate-400">Complete information about this file</p>
            </div>
            <button
              onClick={() => setDetailsFile(null)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Type Badge */}
            <div className="flex items-center gap-3">
              {detailsFile.type === 'pyq' ? (
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <FileText className="w-4 h-4 mr-2" />
                  Previous Year Question Paper
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Lecture Notes
                </span>
              )}
              {detailsFile.is_approved ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                  ✓ Approved
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">
                  ⏳ Pending
                </span>
              )}
            </div>

            {/* Basic Info */}
            <div className="bg-slate-800/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-purple-400 uppercase">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Title</p>
                  <p className="text-sm text-white font-medium">{detailsFile.title}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Subject</p>
                  <p className="text-sm text-white font-medium">{detailsFile.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Course</p>
                  <p className="text-sm text-white font-medium">{detailsFile.branch || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Branch</p>
                  <p className="text-sm text-white font-medium">{detailsFile.branch || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Semester</p>
                  <p className="text-sm text-white font-medium">{detailsFile.semester || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">File Size</p>
                  <p className="text-sm text-white font-medium">{formatFileSize(detailsFile.size)}</p>
                </div>
              </div>
            </div>

            {/* PYQ Specific Info */}
            {detailsFile.type === 'pyq' && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-blue-400 uppercase">PYQ Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Exam Type</p>
                    <p className="text-sm text-white font-medium capitalize">
                      {detailsFile.exam_type || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Academic Year</p>
                    <p className="text-sm text-white font-medium">
                      {detailsFile.academic_year || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Semester Type</p>
                    <p className="text-sm text-white font-medium capitalize">
                      {detailsFile.semester_type || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Info */}
            <div className="bg-slate-800/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-purple-400 uppercase">File Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Filename</p>
                  <p className="text-sm text-white font-mono break-all">{detailsFile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Storage Path</p>
                  <p className="text-xs text-slate-400 font-mono break-all">{detailsFile.path}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Uploaded</p>
                  <p className="text-sm text-white">{formatDate(detailsFile.created_at)}</p>
                </div>
                {detailsFile.noteId && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Note ID</p>
                    <p className="text-xs text-slate-400 font-mono">{detailsFile.noteId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDetailsFile(null)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                handlePreview(detailsFile.path);
                setDetailsFile(null);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Preview File
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
