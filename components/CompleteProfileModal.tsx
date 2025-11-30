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
            <div className="p-6 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Complete Your Profile
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Help us personalize your experience
                  </p>
                </div>
              </div>
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
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Course *
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer appearance-none transition-all"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
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
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Branch *
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
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
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Current Semester *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer appearance-none transition-all"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
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
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Expected Graduation Year *
                </label>
                <input
                  type="number"
                  value={passoutYear}
                  onChange={(e) => setPassoutYear(Number(e.target.value))}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 10}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g., 2026"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-indigo-900/20"
              >
                {isSubmitting ? "Saving..." : "Complete Profile"}
              </button>

              <p className="text-xs text-slate-500 text-center mt-3">
                You can update these details later in settings
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
