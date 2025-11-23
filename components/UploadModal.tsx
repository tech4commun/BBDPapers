'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, FileText, Loader2, CheckCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { saveNoteToDB } from '@/app/upload/actions';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'framer-motion';

// 1. FIX THE INTERFACE
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'notes' | 'pyq'; // <--- We added this line to fix the error
}

export default function UploadModal({ isOpen, onClose, type }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // OPTIMIZE PDF (Client Side)
  const optimizePdf = async (originalFile: File) => {
    try {
      const arrayBuffer = await originalFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Basic optimization: Save cleans up the structure
      const optimizedBytes = await pdfDoc.save();
      
      // Create a new Blob/File
      return new File([new Uint8Array(optimizedBytes)], originalFile.name, {
        type: 'application/pdf',
        lastModified: Date.now(),
      });
    } catch (e) {
      console.error("Optimization failed, using original", e);
      return originalFile; // Fallback to original if optimization fails
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    const uploadTimeout = setTimeout(() => {
      setIsUploading(false);
      alert("❌ Upload timeout - Please try again or check your connection");
    }, 30000); // 30 second timeout

    try {
      console.log("🚀 Starting upload process...");
      
      // 1. Optimize (skip auth check - Server Action will handle it)
      console.log("📦 Optimizing PDF...");
      const optimizedFile = await optimizePdf(file);
      console.log("✅ PDF optimized, size:", optimizedFile.size);

      // 2. Save to DB (Server Action handles storage + auth)
      // Storage upload moved to Server Action to avoid client-side auth timeout
      console.log("💾 Uploading to server...");
      const result = await saveNoteToDB({
        file: optimizedFile,
        fileName: file.name,
        type: type
      });
      console.log("📊 Database result:", result);

      if (!result.success) {
        console.error("❌ Database save failed:", result.error);
        clearTimeout(uploadTimeout);
        throw new Error(result.error || "Failed to save to database");
      }

      // 4. Success State
      clearTimeout(uploadTimeout);
      console.log("🎉 Upload complete!");
      alert("✅ Upload Complete! Sent for Admin Approval.");
      onClose();
      
    } catch (error: any) {
      clearTimeout(uploadTimeout);
      console.error("💥 Upload failed:", error);
      alert(`❌ Upload Failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Dropzone Logic
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()} // Stop click from closing modal
          className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">
              Upload {type === 'pyq' ? 'Previous Year Paper' : 'Lecture Notes'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8">
            {!file ? (
              <div 
                {...getRootProps()} 
                className={`h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : 'border-slate-700 bg-slate-950/50 hover:border-indigo-500/50 hover:bg-slate-900'
                }`}
              >
                <input {...getInputProps()} />
                <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="text-slate-300 font-medium text-lg">
                  {isDragActive ? "Drop it here!" : "Drag & drop PDF here"}
                </p>
                <p className="text-slate-500 text-sm mt-2">or click to browse</p>
              </div>
            ) : (
              <div className="bg-slate-950/50 border border-indigo-500/30 rounded-xl p-6 flex flex-col items-center">
                <FileText className="h-12 w-12 text-indigo-400 mb-4" />
                <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-slate-500 text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                
                <button 
                  onClick={() => setFile(null)}
                  className="text-red-400 text-sm hover:underline"
                >
                  Remove file
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-slate-900/50 flex justify-end gap-3">
             <button 
               onClick={onClose}
               disabled={isUploading}
               className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium"
             >
               Cancel
             </button>
             <button 
               onClick={handleUpload}
               disabled={!file || isUploading}
               className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
               {isUploading ? (
                 <>
                   <Loader2 className="h-4 w-4 animate-spin" />
                   Uploading...
                 </>
               ) : (
                 "Upload File"
               )}
             </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}