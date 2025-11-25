/**
 * Admin Dashboard Overview
 * Stats cards + Recent activity table
 */

import { FileText, Clock, Users as UsersIcon, Activity } from "lucide-react";
import Link from "next/link";
import { getStats } from "./actions";
import { createClient } from "@/utils/supabase/server";

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  href,
}: {
  title: string;
  value: number;
  icon: any;
  gradient: string;
  href?: string;
}) {
  const cardContent = (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:border-indigo-500/30 transition-all duration-300">
      {/* Icon with Gradient */}
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Value */}
      <h3 className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</h3>

      {/* Title */}
      <p className="text-sm text-slate-400">{title}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:scale-105 transition-transform duration-300">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default async function AdminDashboard() {
  // Fetch dashboard stats
  const statsResult = await getStats();
  const stats = "error" in statsResult
    ? { totalNotes: 0, pendingNotes: 0, totalUsers: 0, recentVisits: 0 }
    : statsResult;

  // Fetch recent activity (last 5 uploaded notes)
  const supabase = await createClient();
  const { data: recentNotes } = await supabase
    .from("notes")
    .select(
      `
      id,
      title,
      subject,
      created_at,
      is_approved,
      user_id,
      profiles (
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Monitor your platform's key metrics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Notes"
          value={stats.totalNotes}
          icon={FileText}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingNotes}
          icon={Clock}
          gradient="from-orange-500 to-red-600"
          href="/admin/moderation"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          gradient="from-indigo-500 to-purple-600"
          href="/admin/users"
        />
        <StatCard
          title="24h Visits"
          value={stats.recentVisits}
          icon={Activity}
          gradient="from-green-500 to-emerald-600"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <p className="text-sm text-slate-400 mt-1">Last 5 file actions (uploads, approvals, rejections)</p>
        </div>

        {/* Table Content */}
        {recentNotes && recentNotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {note.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {note.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {note.profiles?.full_name || note.profiles?.email || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {note.is_approved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                          ✓ Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(note.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-slate-400">
            No recent activity found
          </div>
        )}
      </div>
    </div>
  );
}
