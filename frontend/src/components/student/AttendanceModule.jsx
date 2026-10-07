import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Percent
} from 'lucide-react';
import { ScanAttendanceModal } from '../common/PortalModals';

export const AttendanceModule = () => {
  const { currentUser, attendanceSummary, attendanceLogs } = useApp();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const enrollment = currentUser?.enrollment || '123456';
  const summary = attendanceSummary[enrollment] || {
    overall: 87.0,
    attendedTotal: 58,
    absentTotal: 7,
    totalConducted: 65,
    subjects: [
      { code: "MATH301", name: "Mathematics - III", attended: 14, total: 15, percentage: 93.3 },
      { code: "CE302", name: "Data Structures", attended: 15, total: 16, percentage: 93.7 },
      { code: "CE303", name: "Computer Organization", attended: 11, total: 13, percentage: 84.6 },
      { code: "CE304", name: "Web Development", attended: 10, total: 11, percentage: 90.9 },
      { code: "MATH305", name: "Discrete Mathematics", attended: 8, total: 10, percentage: 80.0 }
    ]
  };

  const myLogs = attendanceLogs.filter((l) => l.enrollment === enrollment);
  const overall = summary.overall || 87.0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Attendance & Course Records</h2>
            <p className="text-xs text-slate-500">
              Aggregated course presence records and semester eligibility status
            </p>
          </div>
        </div>

        <button
          onClick={() => setQrModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Live Classroom QR</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Overall Attendance
            </span>
            <p className="text-2xl font-black text-slate-800">{overall}%</p>
            <span className="text-[10px] font-bold text-emerald-600">&ge; 75% Required</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-xs font-bold text-slate-800">
            {overall}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Lectures Present
          </span>
          <p className="text-2xl font-black text-emerald-600">{summary.attendedTotal || 58}</p>
          <span className="text-[10px] text-slate-400">Class sessions verified</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
            Absent Days
          </span>
          <p className="text-2xl font-black text-rose-600">{summary.absentTotal || 7}</p>
          <span className="text-[10px] text-slate-400">Excused: 4 &bull; Unexcused: 3</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Conducted
          </span>
          <p className="text-2xl font-black text-slate-800">{summary.totalConducted || 65}</p>
          <span className="text-[10px] text-slate-400">Across 5 subjects</span>
        </div>
      </div>

      {/* Subject-wise Breakdown Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <span>Subject-Wise Attendance Breakdown</span>
          <span className="text-xs text-slate-400 font-normal">Semester 3 &bull; Computer Engineering</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="pb-3">Course Code</th>
                <th className="pb-3">Course Title</th>
                <th className="pb-3 text-center">Attended / Total</th>
                <th className="pb-3 text-center">Percentage</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(summary.subjects || []).map((sub, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-mono font-bold text-blue-600 text-xs">{sub.code}</td>
                  <td className="py-3 font-semibold text-slate-800">{sub.name}</td>
                  <td className="py-3 text-center font-medium text-slate-600">
                    {sub.attended} / {sub.total}
                  </td>
                  <td className="py-3 text-center">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">{sub.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.percentage >= 75
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}
                    >
                      {sub.percentage >= 75 ? 'Eligible' : 'Warning'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScanAttendanceModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

    </div>
  );
};
