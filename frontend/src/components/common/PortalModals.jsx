import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Upload,
  CheckCircle2,
  QrCode,
  FileText,
  Calendar,
  AlertCircle,
  Download,
  ShieldCheck,
  Check
} from 'lucide-react';

/* 1. Quick Assignment Submission Modal */
export const SubmitAssignmentModal = ({ isOpen, onClose, defaultAsgId }) => {
  const { assignments, submitAssignmentWork } = useApp();
  const [selectedId, setSelectedId] = useState(defaultAsgId || assignments[0]?.id);
  const [fileName, setFileName] = useState('Tree_Traversal_Solution.pdf');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      submitAssignmentWork(selectedId, fileName);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Submit Assignment</h3>
            <p className="text-xs text-slate-400">Upload your coursework solution for grading</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Assignment
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.subject} — {a.title} ({a.dueDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Upload PDF or Archive
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">{fileName}</p>
              <p className="text-[11px] text-slate-400 mt-1">PDF, ZIP, or DOCX (Max 25MB)</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Submission Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments for the professor..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ScanAttendanceModal = ({ isOpen, onClose }) => {
  const { activeQR, submitAttendanceQR } = useApp();
  const [tokenInput, setTokenInput] = useState(activeQR?.token || '');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (activeQR?.token) {
      setTokenInput(activeQR.token);
    }
  }, [activeQR, isOpen]);

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      submitAttendanceQR(tokenInput || activeQR?.token || '');
      setIsVerifying(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Scan Attendance QR</h3>
            <p className="text-xs text-slate-400">Classroom Live Verification Portal</p>
          </div>
        </div>

        {activeQR?.active && (
          <div className="mb-3.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Broadcast from Professor
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active Now
              </span>
            </div>
            <p className="text-slate-700 font-semibold text-xs">{activeQR.subject}</p>
            <p className="text-[11px] text-slate-500">
              {activeQR.code} • {activeQR.room} • {activeQR.professorName || 'Faculty'}
            </p>
          </div>
        )}

        {/* Mock Viewfinder */}
        <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-center p-4 mb-4 border border-slate-800">
          <div className="w-32 h-32 border-2 border-emerald-400 border-dashed rounded-xl flex items-center justify-center relative">
            <div className="w-28 h-28 bg-emerald-500/10 rounded-lg animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
          </div>
          <p className="text-[11px] text-slate-300 mt-3 font-medium">
            Align camera with professor&apos;s live QR screen
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Enter 8-Digit Session Token
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="e.g. GEC Palanpur-LIVE-9042-AUTH"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
          >
            {isVerifying ? (
              <span>Verifying Token...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Live Attendance</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


