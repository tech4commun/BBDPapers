/**
 * Banned User Page
 * Shown to users who have been banned from the platform
 */

import { ShieldAlert, Mail } from "lucide-react";
import Link from "next/link";

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-red-500/10 border-b border-red-500/20 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-4">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Account Suspended
            </h1>
            <p className="text-red-300 text-sm">
              Your access to BBD Papers has been restricted
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-slate-950/50 border border-white/5 rounded-lg p-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                Your account has been suspended due to a violation of our community guidelines or terms of service.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                What this means:
              </p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>You cannot access any resources or features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>You have been automatically signed out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>This email address is blocked from logging in</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-indigo-300 text-sm font-medium mb-1">
                    Think this is a mistake?
                  </p>
                  <p className="text-slate-400 text-xs">
                    Contact our support team to appeal this decision. Include your account details and reason for appeal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-slate-950/30">
            <Link
              href="/"
              className="w-full block text-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-slate-500 text-xs mt-6">
          All ban decisions are final unless successfully appealed
        </p>
      </div>
    </div>
  );
}
