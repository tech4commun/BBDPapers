/**
 * Analytics Page
 * View platform visit logs and user activity
 */

import { Activity, Globe, User, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  
  // Fetch recent analytics logs (last 50 visits)
  const { data: analytics, error } = await supabase
    .from("analytics")
    .select(
      `
      *,
      profiles (
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-300 font-medium">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalVisits = analytics?.length || 0;
  const uniqueIPs = new Set(analytics?.map((a) => a.ip_address)).size;
  const authenticatedVisits = analytics?.filter((a) => a.user_id).length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-slate-400">
          Monitor platform traffic and user activity patterns
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recent Visits</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalVisits}</p>
          <p className="text-sm text-slate-400 mt-1">Last 50 logs shown</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Unique IPs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{uniqueIPs}</p>
          <p className="text-sm text-slate-400 mt-1">Different visitors</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Authenticated</h3>
          </div>
          <p className="text-3xl font-bold text-white">{authenticatedVisits}</p>
          <p className="text-sm text-slate-400 mt-1">Logged-in users</p>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Recent Activity Logs</h2>
          <p className="text-sm text-slate-400 mt-1">Last 50 page visits tracked</p>
        </div>

        {/* Table Content */}
        {analytics && analytics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    User Agent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {new Date(log.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Page Name */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                        /{log.page_name}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {log.profiles ? (
                        <div>
                          <p className="font-medium text-white">
                            {log.profiles.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-400">{log.profiles.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Guest</span>
                      )}
                    </td>

                    {/* IP Address */}
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">
                      {log.ip_address || "N/A"}
                    </td>

                    {/* User Agent (truncated) */}
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                      {log.user_agent || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-slate-400">
            No analytics data found
          </div>
        )}
      </div>
    </div>
  );
}
