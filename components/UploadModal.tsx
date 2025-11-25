'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, FileText, Loader2, CheckCircle, LogIn } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { saveNoteToDB } from '@/app/upload/actions';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { loginWithGoogle, loginWithGitHub } from '@/app/login/actions';
import { toast } from 'sonner';

// BBDU Courses Data (same as resources page)
const bbduCourses = [
  {
    id: "btech",
    name: "Bachelor of Technology (B.Tech)",
    branches: [
      {
        id: "cse",
        name: "Computer Science (CSE)",
        semesters: [
          { id: "sem1", name: "Semester 1", subjects: ["Matrices and Calculus", "Computer Concepts & Programming in C", "Engineering Physics", "Engineering Mechanics", "Basic Electronics Engineering", "Environmental Studies", "Basic Electrical Engineering", "Engineering Chemistry", "Basics of Artificial Intelligence", "Communicative English"] },
          { id: "sem2", name: "Semester 2", subjects: ["Differential Equations and Fourier Analysis", "Programming Concepts with Python", "Engineering Physics", "Engineering Mechanics", "Basic Electronics Engineering", "Environmental Studies", "Basic Electrical Engineering", "Engineering Chemistry", "Basics of Artificial Intelligence", "Communicative English"] },
          { id: "sem3", name: "Semester 3", subjects: ["Organizational Behavior", "Industrial Sociology", "Complex Analysis and Integral Transforms", "Discrete Mathematics", "Data Structure using 'C'", "Digital Logic Design", "Core and Advance Java", "Indian Constitution"] },
          { id: "sem4", name: "Semester 4", subjects: ["Statistical and Numerical Techniques", "Database Management Systems", "Operating Systems", "Software Engineering", "Computer Organization & Architecture"] },
          { id: "sem5", name: "Semester 5", subjects: ["Engineering & Managerial Economics", "Microprocessor and Interfacing", "Computer Networks", "Automata Theory and Formal Languages", "Computer Graphics", "Essence of Indian Knowledge Tradition"] },
          { id: "sem6", name: "Semester 6", subjects: ["Industrial Management", "Design & Analysis of Algorithms", "Compiler Design", "Professional Elective-I", "Professional Elective-II"] },
          { id: "sem7", name: "Semester 7", subjects: ["Distributed Systems", "Soft Computing", "Professional Elective-III", "Open Elective-I"] },
          { id: "sem8", name: "Semester 8", subjects: ["Essentials of Machine Learning", "Professional Elective-IV", "Open Elective-II"] }
        ]
      },
      {
        id: "me",
        name: "Mechanical Engineering",
        semesters: [
          { id: "sem3", name: "Semester 3", subjects: ["Thermodynamics", "Fluid Mechanics", "Material Science", "Mechanics of Solids", "Applied Math-III"] }
        ]
      }
    ]
  },
  {
    id: "bca",
    name: "Bachelor of Computer Apps (BCA)",
    branches: [
      {
        id: "regular",
        name: "Regular",
        semesters: [
          { id: "sem1", name: "Semester 1", subjects: ["Essentials of Professional Comm", "Principle of Management", "Mathematics-I", "Computer Fundamentals", "C Programming"] },
          { id: "sem2", name: "Semester 2", subjects: ["Organization Behavior", "Financial Accounting", "Mathematics-II", "Data Structures", "Digital Electronics"] }
        ]
      },
      {
        id: "ds_ai",
        name: "Data Science & AI (IBM)",
        semesters: [
          { id: "sem1", name: "Semester 1", subjects: ["Intro to AI", "Python Programming", "Mathematics for AI", "Comm Skills", "Operating Systems"] }
        ]
      }
    ]
  },
  {
    id: "bba",
    name: "Bachelor of Business Admin (BBA)",
    branches: [
      {
        id: "gen",
        name: "General",
        semesters: [
          { id: "sem1", name: "Semester 1", subjects: ["Principles of Management", "Microeconomics", "Business Accounting", "Business Comm", "Computer Apps in Mgmt"] }
        ]
      }
    ]
  }
];

// 1. FIX THE INTERFACE
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'notes' | 'pyq';
}

export default function UploadModal({ isOpen, onClose, type }: UploadModalProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Metadata fields
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');

  // PYQ-specific fields
  const [examType, setExamType] = useState(''); // sessional or semester
  const [academicYear, setAcademicYear] = useState(''); // e.g., 2024-25
  const [semesterType, setSemesterType] = useState(''); // even or odd

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get available options based on selections
  const selectedCourse = bbduCourses.find(c => c.id === course);
  const availableBranches = selectedCourse?.branches || [];
  
  const selectedBranch = availableBranches.find(b => b.id === branch);
  const availableSemesters = selectedBranch?.semesters || [];
  
  const selectedSemester = availableSemesters.find(s => s.id === semester);
  const availableSubjects = selectedSemester?.subjects || [];

  // Cascading handlers with reset logic
  const handleCourseChange = (newCourse: string) => {
    setCourse(newCourse);
    setBranch('');
    setSemester('');
    setSubject('');
  };

  const handleBranchChange = (newBranch: string) => {
    setBranch(newBranch);
    setSemester('');
    setSubject('');
  };

  const handleSemesterChange = (newSemester: string) => {
    setSemester(newSemester);
    setSubject('');
  };

  // Check authentication status on mount and when modal opens
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, [isOpen, supabase.auth]);

  // Restore file AND metadata from sessionStorage after login
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const savedFileData = sessionStorage.getItem('pendingUploadFileData');
      const savedMetadata = sessionStorage.getItem('pendingUploadMetadata');
      const savedType = sessionStorage.getItem('pendingUploadType');
      
      if (savedFileData && savedType === type) {
        try {
          const { name, size, lastModified, dataUrl } = JSON.parse(savedFileData);
          
          // Restore metadata if available
          if (savedMetadata) {
            const metadata = JSON.parse(savedMetadata);
            setTitle(metadata.title || '');
            setCourse(metadata.course || '');
            setBranch(metadata.branch || '');
            setSemester(metadata.semester || '');
            setSubject(metadata.subject || '');
            // Restore PYQ-specific fields
            if (type === 'pyq') {
              setExamType(metadata.examType || '');
              setAcademicYear(metadata.academicYear || '');
              setSemesterType(metadata.semesterType || '');
            }
          }
          
          // Convert data URL back to File
          fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
              const restoredFile = new File([blob], name, { 
                type: 'application/pdf',
                lastModified: lastModified 
              });
              setFile(restoredFile);
              console.log('✅ Restored file and metadata after login:', name);
              toast.success('Welcome back! Your file and details are ready.');
              
              // Clear saved data
              sessionStorage.removeItem('pendingUploadFileData');
              sessionStorage.removeItem('pendingUploadMetadata');
              sessionStorage.removeItem('pendingUploadType');
            })
            .catch(err => {
              console.error('Failed to restore file:', err);
              sessionStorage.removeItem('pendingUploadFileData');
              sessionStorage.removeItem('pendingUploadMetadata');
              sessionStorage.removeItem('pendingUploadType');
            });
        } catch (e) {
          console.error('Failed to parse saved file:', e);
          sessionStorage.removeItem('pendingUploadFileData');
          sessionStorage.removeItem('pendingUploadMetadata');
          sessionStorage.removeItem('pendingUploadType');
        }
      }
    }
  }, [isOpen, isAuthenticated, type]);

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

  // Calculate SHA-256 hash of file for duplicate detection (secure)
  const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleUpload = async () => {
    console.log('🎯 Upload button clicked', {
      file: !!file,
      title: title.trim(),
      course,
      branch,
      semester,
      subject,
      type,
      examType,
      academicYear,
      semesterType
    });

    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    // Validate all metadata fields
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!course || !branch || !semester || !subject) {
      console.log('❌ Missing required fields:', { course, branch, semester, subject });
      toast.error('Please fill in all the details (Course, Branch, Semester, Subject)');
      return;
    }

    // Validate PYQ-specific fields ONLY for PYQ type
    if (type === 'pyq' && (!examType || !academicYear || !semesterType)) {
      console.log('❌ Missing PYQ fields:', { examType, academicYear, semesterType });
      toast.error('Please fill in all PYQ details (Exam Type, Academic Year, Semester Type)');
      return;
    }

    // Check if user is authenticated before uploading
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, showing login prompt');
      
      // Double-check auth status to avoid race condition
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // User is actually logged in, just update state and continue
        setIsAuthenticated(true);
        // Don't show login prompt, just proceed with upload
      } else {
        // User is not logged in, show login prompt
        // Save metadata (including PYQ fields)
        const metadata = { 
          title, 
          course, 
          branch, 
          semester, 
          subject,
          ...(type === 'pyq' && { examType, academicYear, semesterType })
        };
        sessionStorage.setItem('pendingUploadMetadata', JSON.stringify(metadata));
        
        // Save file to sessionStorage (only metadata + small data URL for files < 2MB)
        if (file.size < 2 * 1024 * 1024) { // Less than 2MB
          try {
            const reader = new FileReader();
            reader.onloadend = () => {
              const fileData = {
                name: file.name,
                size: file.size,
                lastModified: file.lastModified,
                dataUrl: reader.result as string
              };
              sessionStorage.setItem('pendingUploadFileData', JSON.stringify(fileData));
              sessionStorage.setItem('pendingUploadType', type);
              console.log('💾 Saved file and metadata to session storage');
            };
            reader.readAsDataURL(file);
          } catch (e) {
            console.error('Failed to save file:', e);
          }
        } else {
          // For large files, just save metadata
          sessionStorage.setItem('pendingUploadType', type);
          toast.info('Please select your file again after logging in');
        }
        
        setShowLoginPrompt(true);
        return;
      }
    }

    setIsUploading(true);

    const uploadTimeout = setTimeout(() => {
      setIsUploading(false);
      toast.error("❌ Upload timeout - Please try again or check your connection");
    }, 30000); // 30 second timeout

    try {
      console.log("🚀 Starting upload process...");
      console.log("📋 Selected values:", {
        course,
        selectedCourse: selectedCourse?.name,
        branch,
        selectedBranch: selectedBranch?.name,
        semester,
        selectedSemester: selectedSemester?.name,
        subject
      });
      
      // 1. Calculate file hash for duplicate detection
      console.log("🔐 Calculating file hash...");
      const fileHash = await calculateFileHash(file);
      console.log("✅ File hash calculated:", fileHash.substring(0, 16) + '...');
      
      // 2. Optimize PDF
      console.log("📦 Optimizing PDF...");
      const optimizedFile = await optimizePdf(file);
      console.log("✅ PDF optimized, size:", optimizedFile.size);

      // 3. Save to DB (Server Action handles storage + auth + duplicate check)
      console.log("💾 Uploading to server...");
      const uploadData = {
        file: optimizedFile,
        fileName: file.name,
        type: type,
        title: title.trim(),
        course: selectedCourse?.name || '',
        branch: selectedBranch?.name || '',
        semester: selectedSemester?.name || '',
        subject: subject,
        fileHash: fileHash,
        // PYQ-specific fields
        ...(type === 'pyq' && {
          examType,
          academicYear,
          semesterType
        })
      };
      
      console.log("📤 Sending data to server:", {
        ...uploadData,
        file: '[File Object]',
        fileHash: fileHash.substring(0, 16) + '...'
      });
      
      const result = await saveNoteToDB(uploadData);
      console.log("📊 Database result:", result);

      if (!result.success) {
        console.error("❌ Database save failed:", result.error);
        clearTimeout(uploadTimeout);
        
        // Show detailed error to user
        if (result.error.includes('course')) {
          toast.error("Database Error: 'course' column is missing. Please run the migration script.");
        } else if (result.error.includes('duplicate')) {
          toast.error("This file has already been uploaded!");
        } else {
          toast.error(`Upload Failed: ${result.error}`);
        }
        
        throw new Error(result.error || "Failed to save to database");
      }

      // 4. Success State
      clearTimeout(uploadTimeout);
      console.log("🎉 Upload complete!");
      toast.success("Upload Complete! Sent for Admin Approval.");
      setFile(null);
      onClose();
      
    } catch (error: any) {
      clearTimeout(uploadTimeout);
      console.error("💥 Upload failed:", error);
      toast.error(`Upload Failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('🔐 Initiating Google login');
    const { url } = await loginWithGoogle('/upload');
    if (url) {
      window.location.href = url;
    }
  };

  const handleGitHubLogin = async () => {
    console.log('🔐 Initiating GitHub login');
    await loginWithGitHub('/upload');
  };

  // Dropzone Logic
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Auto-fill title from filename (remove .pdf extension)
      const fileNameWithoutExt = selectedFile.name.replace(/\.pdf$/i, '');
      setTitle(fileNameWithoutExt);
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
        {/* Login Prompt Modal (Overlay on top of Upload Modal) */}
        {showLoginPrompt && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bg-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl w-full max-w-md p-8 z-60"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Login Required</h3>
              <button onClick={() => setShowLoginPrompt(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-slate-300 mb-6">
              Please log in to upload files. Your selected file will be ready to upload after logging in.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-slate-900 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
                Continue with Google
              </button>

              <button
                onClick={handleGitHubLogin}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>
          </motion.div>
        )}

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()} // Stop click from closing modal
          className={`bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${showLoginPrompt ? 'opacity-50 pointer-events-none' : ''}`}
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
          <div className="p-8 max-h-[70vh] overflow-y-auto">
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
              <div className="space-y-6">
                {/* File Preview */}
                <div className="bg-slate-950/50 border border-indigo-500/30 rounded-xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="h-10 w-10 text-indigo-400" />
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Metadata Form */}
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Fill in the details below to help others find this resource:</p>
                  
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Midterm 2023 Solutions"
                      className="w-full px-4 py-2 bg-slate-950 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>

                  {/* Course and Branch - Grid Layout */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Course <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={course}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      >
                        <option value="">Select course...</option>
                        {bbduCourses.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Branch Dropdown */}
                    {course && (
                      <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Branch <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={branch}
                          onChange={(e) => handleBranchChange(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        >
                          <option value="">Select branch...</option>
                          {availableBranches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Semester and Subject - Grid Layout */}
                  {branch && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Semester <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={semester}
                          onChange={(e) => handleSemesterChange(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        >
                          <option value="">Select semester...</option>
                          {availableSemesters.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Subject Dropdown */}
                      {semester && (
                        <div className="animate-fade-in">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Subject <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                          >
                            <option value="">Select subject...</option>
                            {availableSubjects.map((subj, index) => (
                              <option key={index} value={subj}>{subj}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PYQ-Specific Fields - Grid Layout */}
                  {type === 'pyq' && subject && (
                    <div className="grid grid-cols-3 gap-4 animate-fade-in">
                      {/* Exam Type Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Exam Type <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={examType}
                          onChange={(e) => setExamType(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        >
                          <option value="">Select exam type...</option>
                          <option value="sessional">Sessional</option>
                          <option value="semester">Semester</option>
                        </select>
                      </div>

                      {/* Academic Year Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Academic Year <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        >
                          <option value="">Select academic year...</option>
                          <option value="2024-25">2024-25</option>
                          <option value="2023-24">2023-24</option>
                          <option value="2022-23">2022-23</option>
                          <option value="2021-22">2021-22</option>
                          <option value="2020-21">2020-21</option>
                        </select>
                      </div>

                      {/* Semester Type Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Semester Type <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={semesterType}
                          onChange={(e) => setSemesterType(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-950 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        >
                          <option value="">Select semester type...</option>
                          <option value="even">Even Semester</option>
                          <option value="odd">Odd Semester</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
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