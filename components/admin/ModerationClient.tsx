'use client';

import { useState } from 'react';
import { FileText, User, Calendar, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EditApprovalModal from './EditApprovalModal'; // We will create this next

export default function ModerationClient({ notes }: { notes: any[] }) {
  const [selectedNote, setSelectedNote] = useState<any | null>(null);

  console.log("🔵 ModerationClient rendered, selectedNote:", selectedNote?.title || "null");

  const handleReviewClick = (note: any) => {
    console.log("🟢 Review button clicked:", note.title);
    setSelectedNote(note);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div 
            key={note.id}
            className="group bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 flex flex-col"
          >
            {/* Header / Icon */}
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                note.type === 'pyq' 
                  ? 'bg-purple-500/10 text-purple-400' 
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {note.type.toUpperCase()}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-white line-clamp-2" title={note.title}>
                {note.title}
              </h3>
              
              {/* Metadata Chips */}
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                {note.course && <span className="bg-white/5 px-2 py-1 rounded">🎓 {note.course}</span>}
                {note.subject && <span className="bg-white/5 px-2 py-1 rounded">📚 {note.subject}</span>}
                {note.branch && <span className="bg-white/5 px-2 py-1 rounded">🏛️ {note.branch}</span>}
                {note.semester && <span className="bg-white/5 px-2 py-1 rounded">📅 {note.semester}</span>}
              </div>

              {/* Uploader Info */}
              <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 border-t border-white/5 pt-4">
                <User className="h-3 w-3" />
                <span>{note.profiles?.full_name || 'Anonymous'}</span>
                <span className="mx-1">•</span>
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(note.created_at))} ago</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleReviewClick(note)}
              type="button"
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Review & Curate
            </button>
          </div>
        ))}
      </div>

      {/* The Editor Modal */}
      {selectedNote && (
        <EditApprovalModal 
          isOpen={!!selectedNote}
          note={selectedNote} 
          onClose={() => setSelectedNote(null)} 
        />
      )}
    </>
  );
}