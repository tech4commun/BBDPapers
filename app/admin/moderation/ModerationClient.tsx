'use client';

import { useState } from "react";
import { FileText, ExternalLink, Edit } from "lucide-react";
import EditApprovalModal from "@/components/admin/EditApprovalModal";
import { approveNote, rejectNote } from "../actions";
import { useRouter } from "next/navigation";

interface Note {
  id: string;
  title: string;
  subject: string;
  year: string;
  semester: string;
  course: string;
  branch: string;
  file_url: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface ModerationClientProps {
  notes: Note[];
}

export default function ModerationClient({ notes }: ModerationClientProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const router = useRouter();

  const handleModalClose = () => {
    console.log("🔴 Modal closing");
    setSelectedNote(null);
    router.refresh();
  };

  const handleReviewClick = (note: Note) => {
    console.log("🟢 Review button clicked for:", note.title);
    setSelectedNote(note);
  };

  console.log("🔵 ModerationClient render - selectedNote:", selectedNote?.title || "null");

  return (
    <>
      {/* Moderation Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:border-indigo-500/30 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {note.subject} • {note.course} {note.branch}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Year {note.year} • Semester {note.semester}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">Uploaded by:</span>
                <span className="font-medium">
                  {note.profiles?.full_name ||
                    note.profiles?.email ||
                    "Unknown User"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">Submitted:</span>
                <span>
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* View PDF Button */}
              <a
                href={note.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all duration-200 font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View PDF
              </a>

              {/* Review Button - Opens Modal */}
              <button
                onClick={() => handleReviewClick(note)}
                type="button"
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Review & Curate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Approval Modal */}
      {selectedNote && (
        <EditApprovalModal
          isOpen={!!selectedNote}
          onClose={handleModalClose}
          note={selectedNote}
        />
      )}
    </>
  );
}
