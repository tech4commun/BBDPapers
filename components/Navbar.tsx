"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CompactSearch from "./CompactSearch";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/upload", label: "Upload" },
    { href: "/feedback", label: "Feedback" },
  ];

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
    <nav className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo (Left) */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-bold text-blue-400">BBD Notes</span>
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
            <Link
              href="/login"
              className="group relative px-6 py-2 rounded-full bg-indigo-600 text-white font-medium transition-all duration-300 hover:bg-indigo-500 hover:-translate-y-0.5 border-t border-white/20"
            >
              Login
            </Link>
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
                {/* Logo - Crisp and Clean */}
                <Link 
                  href="/" 
                  className="text-2xl font-bold tracking-tight text-white mb-4"
                  onClick={() => setIsOpen(false)}
                >
                  BBD Notes
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
                </div>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="block px-10 py-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all font-medium text-lg shadow-lg border-t border-white/20 mt-4"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
