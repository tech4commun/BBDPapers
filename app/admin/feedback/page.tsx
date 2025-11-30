/**
 * Admin Feedback Management Page
 * View and manage user feedback submissions
 */

import { MessageSquare, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  // Fetch all feedback (without profiles join to avoid relationship error)
  const { data: feedbackList, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Admin feedback fetch error:", error);
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-300 font-medium mb-2">Failed to load feedback</p>
          <p className="text-red-200 text-sm">{error.message}</p>
          <pre className="mt-4 text-xs text-red-200 bg-black/20 p-3 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Fetch user profiles separately to avoid join issues
  const userIds = [...new Set(feedbackList?.map(f => f.user_id) || [])];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", userIds);

  // Create a map for quick lookup
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Merge feedback with profile data
  const enrichedFeedback = feedbackList?.map(feedback => ({
    ...feedback,
    profiles: profileMap.get(feedback.user_id) || null
  })) || [];

  // Group feedback by status
  const pendingFeedback = enrichedFeedback?.filter(f => f.status === 'pending') || [];
  const reviewedFeedback = enrichedFeedback?.filter(f => f.status === 'reviewed') || [];
  const resolvedFeedback = enrichedFeedback?.filter(f => f.status === 'resolved') || [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug':
        return 'bg-red-500/20 text-red-300';
      case 'feature':
        return 'bg-blue-500/20 text-blue-300';
      case 'content':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-500/20 text-orange-300';
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-300';
      case 'resolved':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Feedback Management</h1>
        <p className="text-slate-400">
          View and manage user feedback submissions ({enrichedFeedback?.length || 0} total)
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Pending</h3>
          </div>
          <p className="text-3xl font-bold text-orange-300">{pendingFeedback.length}</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Reviewed</h3>
          </div>
          <p className="text-3xl font-bold text-blue-300">{reviewedFeedback.length}</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Resolved</h3>
          </div>
          <p className="text-3xl font-bold text-green-300">{resolvedFeedback.length}</p>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">All Feedback</h2>
        </div>

        {enrichedFeedback && enrichedFeedback.length > 0 ? (
          <div className="divide-y divide-white/5">
            {enrichedFeedback.map((feedback) => (
              <div key={feedback.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {feedback.profiles?.full_name || feedback.profiles?.email?.split('@')[0] || 'Unknown User'}
                      </p>
                      <p className="text-xs text-slate-400">{feedback.profiles?.email}</p>
                    </div>
                  </div>

                  {/* Category & Status Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                      {feedback.category.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {feedback.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Feedback Message */}
                <div className="bg-slate-950/50 rounded-lg p-4 mb-3">
                  <p className="text-slate-200 text-sm whitespace-pre-wrap">{feedback.message}</p>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(feedback.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <span>•</span>
                  <span>ID: {feedback.id.slice(0, 8)}</span>
                </div>

                {/* Admin Response (if exists) */}
                {feedback.admin_response && (
                  <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                    <p className="text-xs font-semibold text-indigo-300 mb-1">Admin Response:</p>
                    <p className="text-sm text-indigo-200">{feedback.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-slate-400">
            No feedback submitted yet
          </div>
        )}
      </div>
    </div>
  );
}
