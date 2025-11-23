"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const STORAGE_KEY = "feedback_draft";

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      submitFeedback();
      // Clean up URL
      router.replace("/feedback");
    }
  }, [searchParams, user]); // Don't include formData to avoid infinite loops

  const submitFeedback = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // TODO: Insert feedback into Supabase table
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        category: formData.category,
        message: formData.message,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert("Thank you for your feedback! We'll review it shortly.");
      setFormData({ category: "", message: "" });
    } catch (error) {
      console.error("Feedback submission error:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.message.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    // Auth Guard: Check if user is logged in
    if (!user) {
      // Save draft to sessionStorage
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      // Redirect to login with smart resume URL
      router.push("/login?next=/feedback?action=resume");
      return;
    }

    // User is logged in - Submit immediately
    await submitFeedback();
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 md:px-6 py-12 flex items-center justify-center">
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
