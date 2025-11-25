/**
 * Users & Bans Management Page
 * View all users and toggle ban status
 */

import Image from "next/image";
import { ShieldCheck, ShieldAlert, Ban, CheckCircle, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";

// Toggle Ban Server Action
async function toggleBan(userId: string, currentBanStatus: boolean) {
  "use server";
  
  console.log('🚨 [BAN ACTION] Triggered:', { userId, currentBanStatus });
  
  try {
    const supabase = await createClient();
    
    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ [BAN ACTION] No user found');
      throw new Error('Unauthorized');
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    
    if (!profile?.is_admin) {
      console.log('❌ [BAN ACTION] User is not admin');
      throw new Error('Unauthorized - Admin only');
    }
    
    // Toggle ban status
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !currentBanStatus })
      .eq("id", userId);
    
    if (error) {
      console.error('❌ [BAN ACTION] Database error:', error);
      throw error;
    }
    
    console.log('✅ [BAN ACTION] Success:', { userId, newStatus: !currentBanStatus });
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error('💥 [BAN ACTION] Failed:', error);
    throw error;
  }
}

export default async function UsersPage() {
  const supabase = await createClient();
  
  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Count banned users
  const bannedUsersCount = profiles?.filter(p => p.is_banned).length || 0;
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-300 font-medium">Failed to load users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Users & Bans</h1>
        <p className="text-slate-400">
          Manage user accounts and moderation ({profiles?.length || 0} total users)
        </p>
      </div>

      {/* Banned Users Alert Banner */}
      {bannedUsersCount > 0 && (
        <Link href="/admin/banned" className="block">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 hover:bg-red-500/15 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-300 font-medium">
                  {bannedUsersCount} {bannedUsersCount === 1 ? 'user is' : 'users are'} currently banned
                </p>
                <p className="text-red-400/70 text-sm">
                  Click here to view and manage banned users →
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Users Table */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {profiles && profiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User Avatar + Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.full_name || "User"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <span className="text-white font-medium">
                          {profile.full_name || profile.email?.split("@")[0] || "Unknown User"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {profile.email}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      {profile.is_admin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          User
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {profile.is_banned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                          <Ban className="w-3 h-3" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(profile.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {!profile.is_admin && (
                        <form action={toggleBan.bind(null, profile.id, profile.is_banned)}>
                          <button
                            type="submit"
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              profile.is_banned
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                          >
                            {profile.is_banned ? "Unban" : "Ban"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-slate-400">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
