"use client";

import { useState } from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import BanUserModal from "@/components/BanUserModal";
import DeleteUserModal from "@/components/DeleteUserModal";
import { toast } from "sonner";

interface BannedUserActionsClientProps {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
  };
  onUnbanAction: (userId: string) => Promise<void>;
  onDeleteAction: (userId: string) => Promise<void>;
}

export default function BannedUserActionsClient({
  profile,
  onUnbanAction,
  onDeleteAction,
}: BannedUserActionsClientProps) {
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleUnbanConfirm = async () => {
    setIsPending(true);
    try {
      console.log('🔵 [CLIENT] Calling unban action with:', { userId: profile.id });
      await onUnbanAction(profile.id);
      toast.success('User unbanned successfully');
      setShowUnbanModal(false);
    } catch (error) {
      console.error('🔴 [CLIENT] Unban action failed:', error);
      toast.error('Failed to unban user');
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsPending(true);
    try {
      console.log('🔵 [CLIENT] Calling delete action with:', { userId: profile.id });
      await onDeleteAction(profile.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('🔴 [CLIENT] Delete action failed:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Unban Button */}
        <button
          onClick={() => setShowUnbanModal(true)}
          disabled={isPending}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          Unban
        </button>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isPending}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 inline mr-1.5" />
          Delete
        </button>
      </div>

      {/* Unban Confirmation Modal (reusing BanUserModal with isBanned=true) */}
      {showUnbanModal && (
        <BanUserModal
          userName={profile.full_name || profile.email?.split("@")[0] || "Unknown User"}
          userEmail={profile.email}
          isBanned={true}
          onConfirm={handleUnbanConfirm}
          onCancel={() => setShowUnbanModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteUserModal
          userName={profile.full_name || profile.email?.split("@")[0] || "Unknown User"}
          userEmail={profile.email}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
