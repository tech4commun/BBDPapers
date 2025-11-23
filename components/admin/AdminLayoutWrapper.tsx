/**
 * Admin Layout Wrapper
 * Unified client-side layout with collapsible sidebar and mobile drawer
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  GraduationCap, 
  LayoutDashboard, 
  FileClock, 
  Users, 
  Activity, 
  FolderOpen,
  FileStack,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  pendingCount: number;
}

export default function AdminLayoutWrapper({ children, pendingCount }: AdminLayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/moderation",
      label: "Moderation Queue",
      icon: FileClock,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      href: "/admin/files",
      label: "File Manager",
      icon: FileStack,
    },
    {
      href: "/admin/users",
      label: "Users & Bans",
      icon: Users,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: Activity,
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <Link
        href="/"
        className={`flex items-center gap-3 mb-8 transition-all duration-300 ${
          isCollapsed ? "justify-center" : ""
        }`}
        onClick={() => setIsMobileOpen(false)}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white whitespace-nowrap">BBD Papers</h1>
            <p className="text-xs text-slate-400 whitespace-nowrap">Admin Panel</p>
          </div>
        )}
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname.startsWith(link.href) && link.href !== "/admin";
          
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors relative ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? link.label : undefined}
            >
              {/* Icon */}
              <Icon className="w-5 h-5 flex-shrink-0" />
              
              {/* Label (hidden when collapsed) */}
              {!isCollapsed && (
                <>
                  <span className="font-medium whitespace-nowrap overflow-hidden flex-1">
                    {link.label}
                  </span>
                  
                  {/* Notification Badge */}
                  {link.badge && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                      {link.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* Tooltip badge for collapsed state */}
              {isCollapsed && link.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10">
        <Link
          href="/"
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Back to Site" : undefined}
        >
          {isCollapsed ? (
            <span className="text-xl">←</span>
          ) : (
            <>← Back to Site</>
          )}
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen pt-20 bg-[#020617]">
      {/* Mobile Menu Trigger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-24 left-4 z-40 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-20 left-0 h-[calc(100vh-80px)] w-64 bg-slate-950 border-r border-white/10 z-50 flex flex-col p-6 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button for Mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <SidebarContent />
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:flex fixed left-0 top-20 h-[calc(100vh-80px)] bg-slate-950 border-r border-white/10 z-30 flex-col p-6 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Desktop Toggle Button - Outside Sidebar */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 h-6 w-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-all"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ease-in-out p-8 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
