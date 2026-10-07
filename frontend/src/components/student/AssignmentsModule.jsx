import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Download,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SubmitAssignmentModal } from '../common/PortalModals';

export const AssignmentsModule = () => {
  const { assignments, addToast } = useApp();
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsgId, setSelectedAsgId] = useState(null);

  const filters = ['All', 'Due Soon', 'Upcoming', 'Submitted'];

  const filtered = (assignments || []).filter((a) => {
    if (filter === 'All') return true;
    return a.status?.toLowerCase() === filter.toLowerCase();
  });

  const handleOpenSubmit = (id) => {
    setSelectedAsgId(id);
    setModalOpen(true);
  };

  const handleDownloadBrief = (title) => {
    addToast(`Problem Brief downloaded: "${title}.pdf"`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Course Assignments & Projects</h2>
            <p className="text-xs text-slate-500">Track deadlines, problem specifications, and digital coursework submissions</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenSubmit(assignments[0]?.id)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Submission</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((asg, idx) => {
          const isDueSoon = asg.status === 'Due Soon';
          const isSubmitted = asg.status === 'Submitted';

          return (
            <div
              key={asg.id}
              className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold uppercase">
                    {asg.courseCode || asg.subject}
                  </span>
                  
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isDueSoon
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : isSubmitted
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}
                  >
                    {asg.status || 'Upcoming'}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                  {asg.title}
                </h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">{asg.subject}</p>

                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-2">
                  {asg.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: <strong>{asg.dueDate}</strong></span>
                  </div>

                  <button
                    onClick={() => handleDownloadBrief(asg.title)}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 text-[11px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Brief.pdf</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-3">
                {isSubmitted ? (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold text-center border border-emerald-100 flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Submission Received &bull; Under Review</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenSubmit(asg.id)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Submit Coursework</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SubmitAssignmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultAsgId={selectedAsgId}
      />

    </div>
  );
};
