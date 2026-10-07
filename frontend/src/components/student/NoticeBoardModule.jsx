import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Download,
  Building,
  CheckCircle,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

export const NoticeBoardModule = () => {
  const { notices, markNoticeRead, markAllNoticesRead, addToast } = useApp();
  
  // Ensure notices are only holiday notices
  const holidayNotices = (notices || []).filter(
    (n) => n.category === 'Holiday' || (n.holidayType && n.holidayType.includes('Holiday'))
  );

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState(holidayNotices[0] || null);

  const filters = ['All Holidays', 'National Holiday', 'Festival Holiday', 'College Holiday'];

  const filtered = holidayNotices.filter((n) => {
    if (activeFilter === 'All Holidays' || activeFilter === 'All') return true;
    return n.holidayType === activeFilter;
  });

  const handleDownloadCircular = (title) => {
    addToast(`Holiday Circular downloaded: "${title}"`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-800">Academic Holiday Notice Board</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                Official Circulars
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Approved Government Engineering College Palanpur holiday schedules & university break announcements
            </p>
          </div>
        </div>

        <button
          onClick={markAllNoticesRead}
          className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          Mark All As Read
        </button>
      </div>

      {/* Holiday Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              const matching = holidayNotices.filter((n) => {
                if (filter === 'All Holidays') return true;
                return n.holidayType === filter;
              });
              if (matching.length > 0) {
                setSelectedNotice(matching[0]);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/90'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Main Layout: Holiday List & Selected Notice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Holiday Cards List (Col 5) */}
        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-0.5">
          {filtered.map((notice) => {
            const isSelected = selectedNotice?.id === notice.id;
            return (
              <div
                key={notice.id}
                onClick={() => {
                  setSelectedNotice(notice);
                  markNoticeRead(notice.id);
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-xs ring-2 ring-amber-400/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100/80 text-amber-800">
                    {notice.holidayType || 'Holiday'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 font-mono">
                    {notice.date}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {notice.title}
                </h4>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No holiday notices in this category.
            </div>
          )}
        </div>

        {/* Right Column: Full Holiday Notice Reader (Col 7) */}
        {selectedNotice && (
          <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div className="space-y-5">
              
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100/80 text-amber-800 border border-amber-200">
                    {selectedNotice.holidayType || 'Official Holiday'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Circular Ref: GECP/EST/HOLIDAY
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Date: {selectedNotice.date}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {selectedNotice.title}
                </h3>
                <p className="text-xs text-amber-700 font-semibold mt-1">
                  Government Engineering College Palanpur &bull; GTU Affiliated
                </p>
              </div>

              {/* Official Circular Body */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                {selectedNotice.fullContent || selectedNotice.content}
              </div>

              {/* Downloadable Attachment */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-100">
                    PDF
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      GECP_{selectedNotice.title.replace(/\s+/g, '_').substring(0, 24)}_Notice.pdf
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Issued by {selectedNotice.author || 'Office of Principal, GEC Palanpur'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadCircular(selectedNotice.title)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Circular</span>
                </button>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-[11px] text-slate-400">
              <span>Authority: {selectedNotice.author || 'Office of Principal, GEC Palanpur'}</span>
              <span>All Engineering Departments (CE/EC/ME/CL)</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
