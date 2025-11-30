"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteUserModalProps {
  userName: string;
  userEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteUserModal({
  userName,
  userEmail,
  onConfirm,
  onCancel,
}: DeleteUserModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isConfirmValid = confirmText === "DELETE";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
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
          className="relative bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6"
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
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Delete User</h2>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-red-300 font-semibold text-sm">
                  This action cannot be undone!
                </p>
                <p className="text-red-300/80 text-xs">
                  User data will be permanently deleted:
                </p>
                <ul className="text-red-300/80 text-xs list-disc list-inside space-y-0.5 ml-2">
                  <li>Profile and account information</li>
                  <li>All votes and interactions</li>
                  <li>Associated metadata</li>
                </ul>
                <p className="text-yellow-300/80 text-xs mt-2">
                  <strong>Note:</strong> Papers will remain but show "uploaded by user"
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 space-y-1">
            <p className="text-white font-semibold">{userName}</p>
            <p className="text-slate-400 text-sm">{userEmail}</p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Type <span className="text-red-400 font-bold">DELETE</span> to
              confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
              placeholder="DELETE"
              disabled={isProcessing}
              autoComplete="off"
            />
          </div>
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
            disabled={isProcessing || !isConfirmValid}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Deleting..." : "Delete Forever"}
          </button>
        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>,
    document.body
  );
}
