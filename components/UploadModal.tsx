"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, CheckCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadType: "pyq" | "notes";
}

export default function UploadModal({ isOpen, onClose, uploadType }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const modalTitle = uploadType === "pyq" 
    ? "Upload Previous Year Paper" 
    : "Upload Lecture Notes";

  // react-dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError("");

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === "file-invalid-type") {
        setError("Only PDF files are allowed. Please select a PDF file.");
      } else if (rejection.errors[0]?.code === "file-too-large") {
        setError("File size must be less than 10MB.");
      } else {
        setError("Invalid file. Please select a valid PDF file.");
      }
      return;
    }

    // Handle accepted file
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"]
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    // TODO: Implement Supabase upload logic
    console.log("Uploading file:", selectedFile.name, "Type:", uploadType);
    alert(`File "${selectedFile.name}" uploaded successfully!`);
    
    // Reset and close
    setSelectedFile(null);
    setError("");
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-6">
                {modalTitle}
              </h2>

              {/* Dropzone with react-dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDragActive
                    ? "border-white bg-indigo-500/20"
                    : selectedFile
                    ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                    : "border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10"
                }`}
              >
                <input {...getInputProps()} />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                    <p className="text-white font-medium mb-1 text-center px-4">{selectedFile.name}</p>
                    <p className="text-sm text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ) : isDragActive ? (
                  <>
                    <Upload className="w-12 h-12 text-white mb-3 animate-bounce" />
                    <p className="text-white font-medium mb-1">
                      Drop your PDF here
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-indigo-400 mb-3" />
                    <p className="text-white font-medium mb-1">
                      Drag & drop PDF here
                    </p>
                    <p className="text-sm text-slate-400">or click to select file</p>
                    <p className="text-xs text-slate-500 mt-2">(Max size: 10MB)</p>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className={`w-full mt-6 px-6 py-3 rounded-full font-medium text-lg flex items-center justify-center gap-2 transition-all ${
                  selectedFile
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <FileText className="w-5 h-5" />
                Upload File
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
