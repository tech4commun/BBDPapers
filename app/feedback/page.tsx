"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Send, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { submitFeedback } from "./actions";
import { loginWithGoogle, loginWithGitHub } from "@/app/login/actions";
import { toast } from "sonner";

const STORAGE_KEY = "feedback_draft";

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    message: ""
  });
  const supabase = createClient();

  const categories = [
    { value: "", label: "Select a category..." },
    { value: "bug", label: "Report a Bug" },
    { value: "feature", label: "Feature Request" },
    { value: "content", label: "Content Suggestion" }
  ];

  // Auth State Detection
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Restore Draft from sessionStorage
  useEffect(() => {
    const draft = sessionStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
        // Clear draft after restoration
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to restore draft:", error);
      }
    }
  }, []);

  // Smart Resume: Auto-submit after login redirect
  useEffect(() => {
    const action = searchParams.get("action");

    if (action === "resume" && user && formData.category && formData.message) {
      // User returned from login with draft data - auto-submit
      submitFeedbackHandler();
      // Clean up URL
      router.replace("/feedback");
    }
  }, [searchParams, user]); // Don't include formData to avoid infinite loops

  const submitFeedbackHandler = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const result = await submitFeedback({
        category: formData.category as "bug" | "feature" | "content",
        message: formData.message,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to submit feedback");
      }

      toast.success("Thank you for your feedback! We'll review it shortly.");
      setFormData({ category: "", message: "" });
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      toast.error(error.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Auth Guard: Check if user is logged in
    if (!user) {
      // Double-check auth status to avoid race condition
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // User is actually logged in, update state and continue
        setUser(currentUser);
        await submitFeedbackHandler();
        return;
      }
      
      // Save draft to sessionStorage
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      // Show login modal instead of redirecting
      setShowLoginPrompt(true);
      return;
    }

    // User is logged in - Submit immediately
    await submitFeedbackHandler();
  };

  const handleGoogleLogin = async () => {
    console.log('🔐 Initiating Google login from feedback');
    // Save draft before redirecting
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    const { url } = await loginWithGoogle('/feedback?action=resume');
    if (url) {
      window.location.href = url;
    }
  };

  const handleGitHubLogin = async () => {
    console.log('🔐 Initiating GitHub login from feedback');
    // Save draft before redirecting
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    await loginWithGitHub('/feedback?action=resume');
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 md:px-6 py-12 pt-32 flex items-center justify-center">
      {/* Login Prompt Modal Overlay */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Login Required</h3>
                <button onClick={() => setShowLoginPrompt(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-slate-300 mb-6">
                Please log in to submit feedback. Your message will be saved and ready after logging in.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Feedback & Suggestions
          </h1>
          <p className="text-base md:text-lg text-slate-400">
            Help us improve by reporting bugs, suggesting features, or requesting content.
          </p>
        </div>

        {/* Feedback Form - Glass Card with Scale Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {categories.map((cat) => (
                  <option 
                    key={cat.value} 
                    value={cat.value}
                    className="bg-slate-900 text-white"
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Textarea */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                rows={8}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Describe your bug report, feature request, or content suggestion in detail..."
              />
            </div>

            {/* Submit Button - Luminous Style */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all font-medium text-lg shadow-lg hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border-t border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Helper Text */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Your feedback helps us build a better platform for everyone.
        </p>
      </motion.div>
    </div>
  );
}
