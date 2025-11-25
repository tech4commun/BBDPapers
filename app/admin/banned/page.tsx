/**
 * Banned Users Management Page
 * View all banned users and unban them
 */

import Image from "next/image";
import { ShieldAlert, ShieldCheck, UserX, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Unban User Server Action
async function unbanUser(userId: string) {
  "use server";
  
  console.log('🔓 [UNBAN ACTION] Triggered:', { userId });
  
  try {
    const supabase = await createClient();
    
    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ [UNBAN ACTION] No user found');
      throw new Error('Unauthorized');
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    
    if (!profile?.is_admin) {
      console.log('❌ [UNBAN ACTION] User is not admin');
      throw new Error('Unauthorized - Admin only');
    }
    
    // Unban user (set is_banned to false)
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: false })
      .eq("id", userId);
    
    if (error) {
      console.error('❌ [UNBAN ACTION] Database error:', error);
      throw error;
    }
    
    console.log('✅ [UNBAN ACTION] Success:', { userId, newStatus: false });
    
    revalidatePath("/admin/banned");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error('💥 [UNBAN ACTION] Failed:', error);
    throw error;
  }
}

export default async function BannedUsersPage() {
  const supabase = await createClient();
  
  // Fetch only banned profiles
  const { data: bannedProfiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_banned", true)
    .order("created_at", { ascending: false });
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-300 font-medium">Failed to load banned users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Banned Users</h1>
            <p className="text-slate-400">
              Manage suspended accounts ({bannedProfiles?.length || 0} banned users)
            </p>
          </div>
        </div>
      </div>

      {/* Banned Users Table */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {bannedProfiles && bannedProfiles.length > 0 ? (
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
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Banned Since
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bannedProfiles.map((profile) => (
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
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

                    {/* Academic Info */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {profile.course && (
                          <p className="text-xs text-slate-300">
                            <span className="text-slate-500">Course:</span> {profile.course}
                          </p>
                        )}
                        {profile.branch && (
                          <p className="text-xs text-slate-300">
                            <span className="text-slate-500">Branch:</span> {profile.branch}
                          </p>
                        )}
                        {profile.semester && (
                          <p className="text-xs text-slate-300">
                            <span className="text-slate-500">Sem:</span> {profile.semester}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Banned Date */}
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(profile.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <form action={unbanUser.bind(null, profile.id)}>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Unban User
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4">
              <ShieldCheck className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Banned Users</h3>
            <p className="text-slate-400">
              All users are currently in good standing
            </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <UserX className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-indigo-300 text-sm font-medium mb-1">
              About Bans
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Banned users are automatically signed out and cannot access the platform. 
              They will see a banned page when trying to log in. Use the "Unban User" button to restore their access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
