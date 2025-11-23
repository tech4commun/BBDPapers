"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileText, BookOpen, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Lazy load the heavy modal - won't affect page speed until used
const UploadModal = dynamic(() => import("@/components/UploadModal"), {
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-white text-lg">Loading uploader...</div>
    </div>
  ),
  ssr: false
});

export default function UploadPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"pyq" | "notes">("pyq");

  // TODO: Replace with actual Supabase auth check
  const isLoggedIn = false; // Mock: Set to true to test modal

  const uploadOptions = [
    {
      id: "pyq" as const,
      icon: FileText,
      title: "Upload Previous Year Papers",
      description: "Help juniors by sharing exam papers",
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "notes" as const,
      icon: BookOpen,
      title: "Upload Lecture Notes",
      description: "Share your study materials with peers",
      color: "from-indigo-500 to-purple-600"
    }
  ];

  const handleUpload = (type: "pyq" | "notes") => {
    setSelectedType(type);

    // Auth Guard: Check if user is logged in
    if (!isLoggedIn) {
      // Option 1: Redirect to login page
      router.push("/login");
      
      // Option 2: Show toast notification (uncomment to use)
      // alert("You must login to contribute resources.");
      return;
    }

    // User is logged in - Open upload modal
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 md:px-6 py-12 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Share Your Knowledge
          </h1>
          <p className="text-base md:text-lg text-slate-400">
            Select the type of resource you want to contribute.
          </p>
        </div>

        {/* Upload Options - Vertical Stack with Staggered Animation */}
        <div className="space-y-6 mb-8">
          {uploadOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5, ease: "easeOut" }}
                onClick={() => handleUpload(option.id)}
                className="w-full p-6 flex items-center gap-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/80 hover:scale-[1.02] cursor-pointer group"
              >
                {/* Icon with Gradient Glow */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-xl group-hover:shadow-indigo-500/50 transition-shadow`}>
                  <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>

                {/* Text Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {option.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>

        {/* Warning Notice */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-center gap-2 text-amber-400/80"
        >
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">
            Note: Always upload documents in PDF format.
          </p>
        </motion.div>
      </motion.div>

      {/* Upload Modal - Only loads when isModalOpen becomes true */}
      {isModalOpen && (
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          uploadType={selectedType}
        />
      )}
    </div>
  );
}
