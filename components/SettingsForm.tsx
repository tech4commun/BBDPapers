"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Save, Mail, User, BookOpen, GraduationCap, Calendar } from "lucide-react";
import Image from "next/image";
import AvatarSelector from "./AvatarSelector";
import { updateProfileSettings } from "@/app/settings/actions";
import { PRESET_AVATARS } from "@/utils/avatars";

interface SettingsFormProps {
  user: SupabaseUser;
  profile: any;
}

export default function SettingsForm({ user, profile }: SettingsFormProps) {
  const router = useRouter();

  // Avatar state - use profile avatar_url first, fallback to user_metadata
  const [avatar, setAvatar] = useState(
    profile?.avatar_url || user.user_metadata?.avatar_url || PRESET_AVATARS[0]
  );

  // Academic details state
  const [course, setCourse] = useState(profile?.course || "");
  const [branch, setBranch] = useState(profile?.branch || "");
  const [semester, setSemester] = useState(profile?.semester || 1);
  const [passoutYear, setPassoutYear] = useState(profile?.passout_year || new Date().getFullYear() + 4);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      // Optimistic UI update
      const previousAvatar = avatar;
      
      const result = await updateProfileSettings({
        avatar_url: avatar,
        course,
        branch,
        semester,
        passout_year: passoutYear,
      });

      if (!result.success) {
        setError(result.error || "Failed to save settings");
        // Revert optimistic update
        setAvatar(previousAvatar);
        return;
      }

      setSuccess(true);

      // CRITICAL: Force immediate refresh
      router.refresh();
      
      // Also reload the page to ensure Navbar updates
      window.location.reload();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Avatar Preview */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Profile Picture</h2>

        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 overflow-hidden bg-slate-800 shadow-lg">
            <Image
              src={avatar}
              alt="Selected avatar"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Current Avatar</p>
            <p className="text-white font-medium">
              Choose from our premium collection
            </p>
          </div>
        </div>

        {/* Avatar Selector */}
        <AvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />
      </div>

      {/* Account Information */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>

        <div className="space-y-4">
          {/* Email (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Full Name (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              value={user.user_metadata?.full_name || user.user_metadata?.name || "Not set"}
              disabled
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              Name is set by your Google account
            </p>
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Academic Details</h2>

        <div className="space-y-4">
          {/* Course */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <BookOpen className="w-4 h-4" />
              Course *
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <GraduationCap className="w-4 h-4" />
              Branch *
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g., CSE, ECE, Mechanical"
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Semester & Passout Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Calendar className="w-4 h-4" />
                Passout Year *
              </label>
              <input
                type="number"
                value={passoutYear}
                onChange={(e) => setPassoutYear(Number(e.target.value))}
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
          Profile updated successfully!
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving || !course || !branch}
        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium text-lg transition-all ${
          isSaving || !course || !branch
            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        <Save className="w-5 h-5" />
        {isSaving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
