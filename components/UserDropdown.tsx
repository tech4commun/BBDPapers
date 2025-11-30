"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { signOut } from "@/app/login/actions";

interface UserDropdownProps {
  user: SupabaseUser;
  avatarUrl?: string | null;
}

export default function UserDropdown({ user, avatarUrl }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use avatarUrl from profiles table, fallback to user_metadata
  const displayAvatar = avatarUrl || user.user_metadata?.avatar_url;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  // Reset image error when avatar changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border border-white/10 overflow-hidden hover:border-white/30 transition-all hover:scale-105 active:scale-95 bg-slate-800"
        aria-label="User menu"
      >
        {displayAvatar && !imageError ? (
          <Image
            key={displayAvatar}
            src={displayAvatar}
            alt={displayName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl p-2 shadow-2xl z-50 backdrop-blur-xl">
          {/* User Info */}
          <div className="px-3 py-2 border-b border-white/10 mb-2">
            <p className="text-sm font-bold text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>

          {/* Settings Link */}
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-indigo-500/10 hover:text-white rounded-lg transition-all text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>

          {/* Logout Button */}
          <form action={signOut} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
