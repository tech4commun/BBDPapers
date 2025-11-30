'use client';

import { useState, useEffect } from 'react';
import { FileText, Notebook, AlertCircle, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load the modal to keep page fast
const UploadModal = dynamic(() => import('@/components/UploadModal'), {
  ssr: false,
});

export default function UploadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'notes' | 'pyq'>('notes');

  // Check for pending upload after login and auto-open modal
  useEffect(() => {
    const savedType = sessionStorage.getItem('pendingUploadType');
    const savedFileData = sessionStorage.getItem('pendingUploadFileData');
    
    if (savedType && savedFileData) {
      // Auto-open modal with the saved type
      setUploadType(savedType as 'notes' | 'pyq');
      setIsModalOpen(true);
      console.log('✅ Auto-opening modal with type:', savedType);
    }
  }, []);

  const handleUploadClick = (type: 'notes' | 'pyq') => {
    // Open modal - UploadModal handles authentication when user clicks upload
    setUploadType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Share Your Knowledge
          </h1>
          <p className="text-slate-400 text-lg">
            Select the type of resource you want to contribute.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6">
          
          {/* Card 1: PYQ */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUploadClick('pyq');
            }}
            className="group relative flex items-center gap-6 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:bg-slate-900/80 hover:border-indigo-500/50 hover:scale-[1.01] transition-all duration-300 cursor-pointer text-left"
          >
            <div className="h-14 w-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <FileText className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">Upload Previous Year Paper</h3>
              <p className="text-slate-400 text-sm">Help juniors by sharing exam papers.</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          {/* Card 2: Notes */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUploadClick('notes');
            }}
            className="group relative flex items-center gap-6 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:bg-slate-900/80 hover:border-indigo-500/50 hover:scale-[1.01] transition-all duration-300 cursor-pointer text-left"
          >
            <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Notebook className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">Upload Lecture Notes</h3>
              <p className="text-slate-400 text-sm">Share your handwritten or digital notes.</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

        </div>

        {/* Warning */}
        <div className="flex items-center justify-center gap-2 text-amber-400/80 bg-amber-900/10 p-3 rounded-full w-fit mx-auto border border-amber-900/20">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Note: Always upload documents in PDF format.</span>
        </div>

      </div>

      {/* The Modal */}
      {isModalOpen && (
        <UploadModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          type={uploadType} // Ensure your UploadModal component accepts this prop!
        />
      )}
    </div>
  );
}