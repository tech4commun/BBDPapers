"use client";

import { useState } from "react";
import { Ban, Trash2 } from "lucide-react";
import BanUserModal from "@/components/BanUserModal";
import DeleteUserModal from "@/components/DeleteUserModal";
import { toast } from "sonner";

interface UserActionsClientProps {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    is_banned: boolean;
  };
  onBanAction: (userId: string, currentBanStatus: boolean) => Promise<{ success: boolean; newStatus: boolean }>;
  onDeleteAction: (userId: string) => Promise<void>;
}

export default function UserActionsClient({
  profile,
  onBanAction,
  onDeleteAction,
}: UserActionsClientProps) {
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleBanConfirm = async () => {
    setIsPending(true);
    try {
      console.log('🔵 [CLIENT] Calling ban action with:', { userId: profile.id, currentBanStatus: profile.is_banned });
      const result = await onBanAction(profile.id, profile.is_banned);
      console.log('🔵 [CLIENT] Ban action result:', result);
      toast.success(profile.is_banned ? 'User unbanned successfully' : 'User banned successfully');
      setShowBanModal(false);
    } catch (error) {
      console.error('🔴 [CLIENT] Ban action failed:', error);
      toast.error('Failed to update ban status');
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
        {/* Ban/Unban Button */}
        <button
          onClick={() => setShowBanModal(true)}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 ${
            profile.is_banned
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          <Ban className="w-4 h-4 inline mr-1.5" />
          {profile.is_banned ? "Unban" : "Ban"}
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

      {/* Ban Confirmation Modal */}
      {showBanModal && (
        <BanUserModal
          userName={profile.full_name || profile.email?.split("@")[0] || "Unknown User"}
          userEmail={profile.email}
          isBanned={profile.is_banned}
          onConfirm={handleBanConfirm}
          onCancel={() => setShowBanModal(false)}
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
