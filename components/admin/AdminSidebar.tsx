/**
 * Admin Sidebar Component
 * Collapsible navigation with smooth width transitions
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
  ChevronRight
} from "lucide-react";

interface AdminSidebarProps {
  pendingCount: number;
}

export default function AdminSidebar({ pendingCount }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
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

  return (
    <>
      {/* Collapsible Sidebar */}
      <aside 
        className={`fixed left-0 top-[80px] h-[calc(100vh-80px)] bg-slate-900 border-r border-white/10 p-6 flex flex-col z-30 overflow-y-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Logo */}
        <Link 
          href="/" 
          className={`flex items-center gap-3 mb-8 transition-all duration-300 ${
            isCollapsed ? "justify-center" : ""
          }`}
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
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-300"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? link.label : undefined}
              >
                {/* Icon */}
                <Icon className="w-5 h-5 flex-shrink-0" />
                
                {/* Label (hidden when collapsed) */}
                {!isCollapsed && (
                  <>
                    <span className="font-medium whitespace-nowrap overflow-hidden">
                      {link.label}
                    </span>
                    
                    {/* Notification Badge */}
                    {link.badge && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && link.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
      </aside>

      {/* Spacer div to provide the dynamic margin for content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
        style={{ minHeight: "100vh" }}
      />
    </>
  );
}
