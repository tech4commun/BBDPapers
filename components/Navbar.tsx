"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import CompactSearch from "./CompactSearch";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const supabase = createClient();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/upload", label: "Upload" },
    { href: "/feedback", label: "Feedback" },
  ];

  // Auth State Detection
  useEffect(() => {
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;

    // Check active session immediately
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      
      // Query profiles table for admin status and avatar
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, avatar_url")
          .eq("id", data.user.id)
          .single();
        
        setIsAdmin(profile?.is_admin ?? false);
        setAvatarUrl(profile?.avatar_url ?? null);

        // Subscribe to realtime profile updates
        profileChannel = supabase
          .channel(`profile-${data.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${data.user.id}`,
            },
            (payload) => {
              // Update avatar and admin status instantly
              setAvatarUrl(payload.new.avatar_url ?? null);
              setIsAdmin(payload.new.is_admin ?? false);
            }
          )
          .subscribe();
      } else {
        setIsAdmin(false);
        setAvatarUrl(null);
      }
    });

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Cleanup old profile subscription
      if (profileChannel) {
        await supabase.removeChannel(profileChannel);
        profileChannel = null;
      }

      // Query admin status and avatar on auth change
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, avatar_url")
          .eq("id", session.user.id)
          .single();
        
        setIsAdmin(profile?.is_admin ?? false);
        setAvatarUrl(profile?.avatar_url ?? null);

        // Subscribe to realtime profile updates
        profileChannel = supabase
          .channel(`profile-${session.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${session.user.id}`,
            },
            (payload) => {
              // Update avatar and admin status instantly
              setAvatarUrl(payload.new.avatar_url ?? null);
              setIsAdmin(payload.new.is_admin ?? false);
            }
          )
          .subscribe();
      } else {
        setIsAdmin(false);
        setAvatarUrl(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
    };
  }, [supabase]);

  // Scroll lock when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 w-full px-4 md:px-8 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="flex h-full w-full items-center justify-between">
        {/* Logo (Far Left) */}
        <Link 
          href="/" 
          className="flex-shrink-0 mr-8"
        >
          <Image
            src="/logo.png"
            alt="BBD Papers Logo"
            width={500}
            height={100}
            priority
            className="h-10 md:h-14 w-auto object-contain hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Compact Search (Center) - Hidden on Mobile & Homepage with Animation */}
        <AnimatePresence mode="wait">
          {!isHomePage && (
            <motion.div
              key="compact-search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex flex-1 justify-center max-w-md mx-4"
            >
              <CompactSearch />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Navigation (Right) - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative group text-slate-300 hover:text-blue-400 transition-colors font-medium after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 after:ease-in-out hover:after:w-full hover:after:left-0"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="relative group text-amber-400 font-bold transition-colors hover:text-amber-300 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin
              <span className="absolute -bottom-1 left-1/2 h-[2px] w-0 bg-amber-400 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
            </Link>
          )}
          {user ? (
            <UserDropdown user={user} avatarUrl={avatarUrl} />
          ) : (
            <Link
              href={`/login?next=${pathname}`}
              className="group relative px-6 py-2 rounded-full bg-indigo-600 text-white font-medium transition-all duration-300 hover:bg-indigo-500 hover:-translate-y-0.5 border-t border-white/20"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button - Visible on Mobile Only */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      {/* Mobile Slide-Over Drawer with True Fixed Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay - Full Screen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Panel - Slide from Right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-[100dvh] w-[80%] max-w-sm bg-slate-900 shadow-2xl border-l border-white/10"
            >
              {/* Close Button - Absolute Top Right */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-800/50 transition-colors z-10"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>

              {/* Centered Content - No Scrollbars */}
              <div className="flex flex-col justify-center items-center h-full gap-8 px-6">
                {/* Logo - Centerpiece */}
                <Link 
                  href="/" 
                  className="hover:scale-105 transition-transform duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <Image
                    src="/logo.png"
                    alt="BBD Papers Logo"
                    width={400}
                    height={80}
                    className="h-16 w-auto object-contain"
                  />
                </Link>

                {/* Navigation Links with Center-Out Underline */}
                <div className="flex flex-col items-center gap-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="relative text-xl font-medium text-slate-300 transition-colors hover:text-white group"
                    >
                      {link.label}
                      {/* The Center-Out Line */}
                      <span className="absolute -bottom-1 left-1/2 h-[2px] w-0 bg-indigo-500 transition-all duration-300 ease-in-out group-hover:left-0 group-hover:w-full"></span>
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="relative group flex items-center gap-2 text-xl font-bold text-amber-400 transition-colors hover:text-amber-300"
                    >
                      <ShieldAlert className="w-5 h-5" />
                      Admin
                      <span className="absolute -bottom-1 left-1/2 h-[2px] w-0 bg-amber-400 transition-all duration-300 ease-in-out group-hover:left-0 group-hover:w-full"></span>
                    </Link>
                  )}
                </div>

                {/* Login Button or User Dropdown */}
                {user ? (
                  <UserDropdown user={user} avatarUrl={avatarUrl} />
                ) : (
                  <Link
                    href={`/login?next=${pathname}`}
                    className="block px-10 py-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all font-medium text-lg shadow-lg border-t border-white/20 mt-4"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
