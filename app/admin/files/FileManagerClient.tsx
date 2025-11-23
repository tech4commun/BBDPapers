'use client';

import { useState, useRef } from 'react';
import { FileText, Trash2, Clock, User, ExternalLink, Upload, Edit, Search, X } from 'lucide-react';
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
  branch: string | null;
  semester: string | null;
  is_approved: boolean;
}

export default function FileManagerClient({ files }: { files: FileItem[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                File / Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  {searchQuery ? `No files match "${searchQuery}"` : "No files found"}
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) =>
              <tr key={file.path} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{file.title}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {file.subject}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {file.branch || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {file.semester || '-'}
                </td>
                <td className="px-6 py-4">
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
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="application/pdf"
                      ref={(el) => { fileInputRefs.current[file.path] = el; }}
                      onChange={(e) => handleFileSelect(file.path, file.name, e)}
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => handlePreview(file.path)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Preview
                    </button>
                    
                    {file.noteId && (
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleReplaceClick(file.path)}
                      disabled={isReplacing === file.path}
                      className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {isReplacing === file.path ? 'Replacing...' : 'Replace'}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(file.path, file.name)}
                      disabled={isDeleting === file.path}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting === file.path ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit Metadata Modal */}
      {selectedFile && selectedFile.noteId && (
        <EditMetadataModal
          noteId={selectedFile.noteId}
          currentData={{
            title: selectedFile.title,
            subject: selectedFile.subject,
            branch: selectedFile.branch || 'CSE',
            semester: selectedFile.semester || 'Semester 1'
          }}
          onClose={() => {
            setSelectedFile(null);
            router.refresh();
          }}
        />
      )}
    </div>
    </>
  );
}
