"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Calendar, Award } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

// Course-specific branch mappings
const BRANCH_OPTIONS = {
  "B.Tech": [
    "Computer Science",
    "Information Technology",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
  ],
  BCA: ["Computer Applications"],
  BBA: ["Business Administration", "Finance", "Marketing", "HR"],
};

export default function CompleteProfileModal({
  isOpen,
  onComplete,
}: CompleteProfileModalProps) {
  const [course, setCourse] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [semester, setSemester] = useState<number>(1);
  const [passoutYear, setPassoutYear] = useState<number>(
    new Date().getFullYear() + 4
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset branch when course changes
  useEffect(() => {
    setBranch("");
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!course || !branch || !semester || !passoutYear) {
      setError("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    const result = await updateProfile({
      course,
      branch,
      semester,
      passout_year: passoutYear,
    });

    setIsSubmitting(false);

    if (result.success) {
      onComplete();
    } else {
      setError(result.error || "Failed to update profile");
    }
  };

  const availableBranches = course ? BRANCH_OPTIONS[course as keyof typeof BRANCH_OPTIONS] || [] : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-lg w-full bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Complete Your Profile
              </h2>
              <p className="text-white/80 text-sm">
                Help us personalize your experience with your academic details
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Course */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <BookOpen className="w-4 h-4" />
                  Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                >
                  <option value="">Select your course</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                </select>
              </div>

              {/* Branch (Dynamic) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Award className="w-4 h-4" />
                  Branch/Specialization
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={!course}
                >
                  <option value="">
                    {course ? "Select your branch" : "Select course first"}
                  </option>
                  {availableBranches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="w-4 h-4" />
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Passout Year */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Expected Passout Year
                </label>
                <input
                  type="number"
                  value={passoutYear}
                  onChange={(e) => setPassoutYear(Number(e.target.value))}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 10}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g., 2026"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Saving..." : "Complete Profile"}
              </button>

              <p className="text-xs text-slate-400 text-center mt-4">
                You can update these details later from your profile settings
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
