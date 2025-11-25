'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateNoteMetadata } from '../actions';
import { toast } from 'sonner';

interface EditMetadataModalProps {
  noteId: string;
  currentData: {
    title: string;
    subject: string;
    course?: string;
    branch: string;
    semester: string;
    type: 'notes' | 'pyq';
    exam_type?: string;
    academic_year?: string;
    semester_type?: string;
  };
  onClose: () => void;
}

export default function EditMetadataModal({ noteId, currentData, onClose }: EditMetadataModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ...currentData,
    course: currentData.course || 'B.Tech'
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateNoteMetadata(noteId, formData);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success("Metadata updated successfully");
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative z-[101]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-white">Edit Metadata</h2>
              <p className="text-sm text-slate-400">Update file information</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">
                Title
              </label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">
                  Subject
                </label>
                <input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                  placeholder="e.g. Engineering Maths"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">
                  Course
                </label>
                <select
                  value={formData.course || 'B.Tech'}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">
                  Branch
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="IT">Information Tech (IT)</option>
                  <option value="ME">Mechanical (ME)</option>
                  <option value="CE">Civil (CE)</option>
                  <option value="EE">Electrical (EE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={`Semester ${sem}`}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PYQ-specific fields - Only show for PYQ type */}
            {currentData.type === 'pyq' && (
              <>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <p className="text-sm font-semibold text-purple-400 mb-3">📝 PYQ-Specific Details</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">
                      Exam Type
                    </label>
                    <select
                      value={formData.exam_type || ''}
                      onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                      <option value="">Select Exam Type</option>
                      <option value="sessional">Sessional</option>
                      <option value="semester">Semester</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">
                      Academic Year
                    </label>
                    <select
                      value={formData.academic_year || ''}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                      <option value="">Select Academic Year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={`${year}-${year + 1}`}>
                            {year}-{year + 1}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">
                    Semester Type
                  </label>
                  <select
                    value={formData.semester_type || ''}
                    onChange={(e) => setFormData({ ...formData, semester_type: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="">Select Semester Type</option>
                    <option value="odd">Odd Semester</option>
                    <option value="even">Even Semester</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-slate-900/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
