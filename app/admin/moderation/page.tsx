import { CheckCircle, AlertCircle } from "lucide-react";
import { getPendingContent } from "../actions"; // Ensure this path is correct
import ModerationClient from "@/components/admin/ModerationClient"; // Import the new component

export default async function ModerationPage() {
  // 1. Fetch Data
  console.log("🔍 ModerationPage: Starting fetch...");
  const result = await getPendingContent();
  console.log("🔍 ModerationPage: Result:", result);

  // 2. Handle Errors
  if ("error" in result) {
    console.error("❌ ModerationPage: Error detected:", result.error);
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-red-400 font-bold mb-2">Error Loading Pending Content</h3>
          <p className="text-red-300 text-sm mb-4">{result.error}</p>
          <details className="text-xs text-slate-400">
            <summary className="cursor-pointer hover:text-slate-300">Debug Info</summary>
            <pre className="mt-2 bg-slate-900 p-3 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  const pendingNotes = result.data || [];
  console.log("✅ ModerationPage: Pending notes count:", pendingNotes.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Curator Queue</h1>
        <p className="text-slate-400">
          Review submissions and fix metadata before publishing. 
          <span className="ml-2 text-indigo-400 font-semibold">({pendingNotes.length} pending)</span>
        </p>
      </div>

      {/* 3. Render the Client Component */}
      {pendingNotes.length > 0 ? (
        <ModerationClient notes={pendingNotes} />
      ) : (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/20">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-slate-400">No pending content to review.</p>
          <p className="text-xs text-slate-500 mt-4">Check your terminal/console for debug logs</p>
        </div>
      )}
    </div>
  );
}