import { FileText, Download, Trash2, Clock, User } from "lucide-react";
import { listAllFiles } from "../actions";
import FileManagerClient from "./FileManagerClient";

export default async function FilesPage() {
  const result = await listAllFiles();

  if (result.error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-red-400 font-bold mb-2">Error Loading Files</h3>
          <p className="text-red-300 text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  const files = result.files || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">File Manager</h1>
        <p className="text-slate-400">
          Manage all uploaded files in storage
          <span className="ml-2 text-indigo-400 font-semibold">({files.length} files)</span>
        </p>
      </div>

      {/* File List */}
      {files.length > 0 ? (
        <FileManagerClient files={files} />
      ) : (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Files Found</h3>
          <p className="text-slate-400">No files have been uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
