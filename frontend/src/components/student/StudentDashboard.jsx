import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QRScannerModal } from './QRScannerModal';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  HelpCircle,
  FolderGit2,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

export const StudentDashboard = () => {
  const {
    currentUser,
    timetable,
    attendanceSummary,
    attendanceLogs,
    doubts,
    assignments,
    activeQR,
    setActiveTab
  } = useApp();

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Student specific stats
  const enrollment = currentUser?.enrollment || '2024CS101';
  const mySummary = attendanceSummary[enrollment] || {
    overall: 88.5,
    attendedTotal: 46,
    totalConducted: 52,
    subjects: []
  };

  // Find active or next upcoming lecture
  const activeOrUpcoming = timetable.find((s) => s.status === 'Live Now') || timetable[0];

  // Check if attendance already marked for active lecture
  const isAlreadyMarked = attendanceLogs.some(
    (log) => log.lectureId === activeOrUpcoming?.id && log.enrollment === enrollment
  );

  // Filter student doubts
  const myDoubts = doubts.filter((d) => d.enrollment === enrollment);
  const pendingDoubts = myDoubts.filter((d) => d.status === 'Pending').length;

  // Filter assignments due
  const myAssignmentsDue = assignments.filter((a) => {
    const hasSubmitted = a.submissions.some((s) => s.enrollment === enrollment);
    return !hasSubmitted;
  }).length;

  // Today's classes (Monday default for demo)
  const todayClasses = timetable.filter((s) => s.day === 'Monday');

  const attendancePercentage = mySummary.overall || 85;
  const isEligibleForExams = attendancePercentage >= 75;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner & Quick Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-900/80 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center space-x-2">
              <span className="font-mono text-indigo-400 font-semibold">{currentUser?.enrollment}</span>
              <span>&bull;</span>
              <span>{currentUser?.departmentCode || 'CSE'} &mdash; Sem {currentUser?.semester || 4}</span>
              <span>&bull;</span>
              <span className="text-slate-300">CGPA: <strong>{currentUser?.cgpa || '9.1'}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Live Attendance QR</span>
          </button>
        </div>
      </div>

      {/* Hero Card: Upcoming / Active Lecture */}
      {activeOrUpcoming && (
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {activeOrUpcoming.status === 'Live Now' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
                    LIVE LECTURE IN PROGRESS
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    UPCOMING TODAY &bull; {activeOrUpcoming.startTime}
                  </span>
                )}
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {activeOrUpcoming.code}
                </span>
                <span className="text-xs text-slate-400">
                  {activeOrUpcoming.departmentCode} Sem {activeOrUpcoming.semester}
                </span>
              </div>

              <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeOrUpcoming.subject}
              </h3>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-300 pt-1">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400">
                    <User className="w-4 h-4" />
                  </div>
                  <span>{activeOrUpcoming.professorName}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-white">{activeOrUpcoming.room}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>{activeOrUpcoming.startTime} &ndash; {activeOrUpcoming.endTime}</span>
                </div>
              </div>

              {activeOrUpcoming.notes && (
                <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 max-w-2xl">
                  <strong className="text-slate-300">Agenda / Lab Focus:</strong> {activeOrUpcoming.notes}
                </p>
              )}
            </div>

            {/* Right Card Action Box */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/70 rounded-2xl border border-slate-800 text-center">
              {isAlreadyMarked ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Attendance Verified</h4>
                  <p className="text-xs text-slate-400">You are marked Present for today's session.</p>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Classroom Attendance</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Scan the active QR to record your presence</p>
                  </div>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan Live QR Code</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* High-level Academic Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
            <div className={`p-2 rounded-xl ${isEligibleForExams ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{attendancePercentage}%</span>
            <span className="text-xs text-slate-400">({mySummary.attendedTotal}/{mySummary.totalConducted} classes)</span>
          </div>
          <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1">
            {isEligibleForExams ? (
              <span className="text-emerald-400 font-medium">Eligible for end-term exams (Goal: 75%+)</span>
            ) : (
              <span className="text-rose-400 font-medium">Warning: Attendance below mandatory 75%</span>
            )}
          </p>
        </div>

        {/* Doubts Status */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doubt Resolution</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{myDoubts.length}</span>
            <span className="text-xs text-slate-400">submitted total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Pending: <strong className="text-amber-400">{pendingDoubts}</strong></span>
            <span>Answered: <strong className="text-emerald-400">{myDoubts.length - pendingDoubts}</strong></span>
          </div>
          <button
            onClick={() => setActiveTab('doubts')}
            className="text-[11px] text-cyan-400 hover:underline mt-2 flex items-center space-x-1"
          >
            <span>Ask a new question</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Assignments Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignments</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{myAssignmentsDue}</span>
            <span className="text-xs text-slate-400">due for submission</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Total active assignments: <strong className="text-slate-200">{assignments.length}</strong>
          </p>
          <button
            onClick={() => setActiveTab('materials')}
            className="text-[11px] text-amber-400 hover:underline mt-2 flex items-center space-x-1"
          >
            <span>View dropzone & deadlines</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Academic Standing */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Standing</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{currentUser?.cgpa || '9.18'}</span>
            <span className="text-xs text-slate-400">Cumulative GPA</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Dean's Honor List &bull; Top 5% of Batch
          </p>
          <button
            onClick={() => setActiveTab('profile')}
            className="text-[11px] text-purple-400 hover:underline mt-2 flex items-center space-x-1"
          >
            <span>View student transcript</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Today's Schedule Overview */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Today's Lecture Schedule (Monday)</span>
            </h3>
            <p className="text-xs text-slate-400">Filtered for your batch: {currentUser?.departmentCode} Semester {currentUser?.semester}</p>
          </div>
          <button
            onClick={() => setActiveTab('timetable')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Full Week Timetable</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todayClasses.map((slot) => {
            const isLive = slot.status === 'Live Now';
            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isLive
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">{slot.code}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isLive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : slot.status === 'Cancelled'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">{slot.subject}</h4>
                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <p className="flex items-center space-x-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{slot.startTime} &ndash; {slot.endTime}</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{slot.room}</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{slot.professorName}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />

    </div>
  );
};
