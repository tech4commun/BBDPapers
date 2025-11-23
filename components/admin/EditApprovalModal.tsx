'use client';

import { useState } from 'react';
import { X, ExternalLink, Check, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { approveNote, rejectNote, getSignedUrl } from '@/app/admin/actions';
import { toast } from 'sonner';

interface EditModalProps {
  note: any;
  onClose: () => void;
  isOpen: boolean;
}

export default function EditApprovalModal({ note, onClose, isOpen }: EditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Don't render if not open or no note
  if (!isOpen || !note) return null;
  
  // Local state for curation (Pre-fill with existing data)
  const [formData, setFormData] = useState({
    title: note.title,
    subject: note.subject || '',
    branch: note.branch || 'CSE', // Default suggestion
    semester: note.semester || 'Semester 1',
  });

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // 1. Get Secure Download URL to verifying user can view it (Optional check)
      // 2. Call Server Action
      const result = await approveNote(note.id, formData);
      
      if (result.error) throw new Error(result.error);
      
      toast.success("Note Approved & Published!");
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) return;
    
    setIsLoading(true);
    try {
      const result = await rejectNote(note.id, note.file_path);
      if (result.error) throw new Error(result.error);
      
      toast.success("Submission Rejected & Deleted");
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      toast.info("Generating secure preview link...");
      const result = await getSignedUrl(note.file_path);
      
      if (result.error || !result.url) {
        throw new Error(result.error || "Failed to generate preview link");
      }
      
      window.open(result.url, '_blank');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-white">Curate Submission</h2>
              <p className="text-sm text-slate-400">Uploaded by {note.profiles?.full_name}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
          </div>

          {/* Body - Scrollable */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* File Preview Bar */}
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-500/10 flex items-center justify-center rounded-lg text-red-400">
                  <span className="text-xs font-bold">PDF</span>
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium truncate max-w-[200px]">{note.file_path.split('/').pop()}</p>
                  <p className="text-slate-500">{(note.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {/* Preview button with actual functionality */}
              <button 
                onClick={handlePreview}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" /> Preview
              </button>
            </div>

            {/* Editing Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Title</label>
                <input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Subject</label>
                  <input 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                    placeholder="e.g. Engineering Maths"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Branch</label>
                  <select 
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none appearance-none"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="IT">Information Tech (IT)</option>
                    <option value="ME">Mechanical (ME)</option>
                    <option value="CE">Civil (CE)</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Semester</label>
                <select 
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none appearance-none"
                >
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={`Semester ${sem}`}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-slate-900/50 flex justify-between">
            <button 
              onClick={handleReject}
              disabled={isLoading}
              className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Reject
            </button>

            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                disabled={isLoading}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Approve & Publish
              </button>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}