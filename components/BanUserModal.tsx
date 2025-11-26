"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Ban, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BanUserModalProps {
  userName: string;
  userEmail: string;
  isBanned: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BanUserModal({
  userName,
  userEmail,
  isBanned,
  onConfirm,
  onCancel,
}: BanUserModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onConfirm();
    setIsProcessing(false);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
        onClick={onCancel}
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6"
          style={{ zIndex: 10000 }}
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>

        {/* Icon & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            {isBanned ? (
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            ) : (
              <Ban className="w-8 h-8 text-red-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isBanned ? "Unban User?" : "Ban User?"}
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-slate-300 text-center">
            {isBanned
              ? "This will restore access for:"
              : "This will restrict access for:"}
          </p>
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-1">
            <p className="text-white font-semibold">{userName}</p>
            <p className="text-slate-400 text-sm">{userEmail}</p>
          </div>
          {!isBanned && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-300 text-sm">
                <strong>Warning:</strong> The user will be immediately signed out
                and unable to access the platform.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition-colors disabled:opacity-50 ${
              isBanned
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isProcessing
              ? "Processing..."
              : isBanned
              ? "Yes, Unban"
              : "Yes, Ban User"}
          </button>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
