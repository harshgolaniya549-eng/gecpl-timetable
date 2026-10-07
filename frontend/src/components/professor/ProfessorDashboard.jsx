import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  HelpCircle,
  FolderGit2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Send,
  User
} from 'lucide-react';

export const ProfessorDashboard = () => {
  const {
    currentUser,
    timetable,
    activeQR,
    doubts,
    assignments,
    attendanceLogs,
    setActiveTab,
    generateQR
  } = useApp();

  const profEmail = currentUser?.email || 'dr.sharma@college.edu';
  const profNameUpper = (currentUser?.name || '').toUpperCase();

  // Filter slots for this professor or fallback to department timetable
  const matchedSlots = timetable.filter(
    (s) =>
      s.professorEmail === profEmail ||
      s.professorId === currentUser?.id ||
      (profNameUpper && (s.faculty || s.facultyName || '').toUpperCase().includes(profNameUpper))
  );
  const mySlots = matchedSlots.length > 0 ? matchedSlots : timetable.slice(0, 6);

  // Today's classes
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
  const todayClasses = mySlots.filter((s) => s.day === (isWeekend ? 'Monday' : dayName));

  // Filter doubts directed to this professor
  const myDoubts = doubts.filter((d) => d.professorEmail === profEmail);
  const pendingDoubts = myDoubts.filter((d) => d.status === 'Pending');

  // Filter assignments created by this professor
  const myAssignments = assignments.filter((a) => a.professorEmail === profEmail);
  const totalSubmissions = myAssignments.reduce(
    (acc, curr) => acc + (curr.submissions?.length || 0),
    0
  );

  // Check if active QR is running for this professor
  const isMyQRActive = activeQR && activeQR.active && activeQR.professorEmail === profEmail;

  // Active lecture roster count
  const activeLectureCheckins = attendanceLogs.filter(
    (l) => l.lectureId === activeQR?.slotId
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          {currentUser?.avatar ? (
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 ring-2 ring-indigo-500/40 shadow-lg shrink-0">
              <User className="w-8 h-8 text-indigo-400" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Faculty Workspace &bull; {currentUser?.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-x-2">
              <span className="font-semibold text-indigo-400">{currentUser?.designation}</span>
              <span>&bull;</span>
              <span>{currentUser?.department}</span>
              <span>&bull;</span>
              <span className="font-mono text-slate-300">{currentUser?.facultyId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('attendance')}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Live QR Session</span>
          </button>
        </div>
      </div>

      {/* Live Classroom Status Card */}
      {isMyQRActive ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
                LIVE ATTENDANCE BROADCAST BROADCASTING NOW
              </span>
              <h3 className="text-xl font-black text-white">{activeQR.subject}</h3>
              <p className="text-xs text-slate-400">
                Classroom: <strong className="text-white">{activeQR.room}</strong> &bull; Token:{' '}
                <code className="text-indigo-400 font-mono font-bold">{activeQR.token}</code>
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">
                  {activeLectureCheckins.length}
                </span>
                <span className="text-xs text-slate-400 block">Students Verified</span>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Manage QR Screen
              </button>
            </div>
          </div>
        </div>
      ) : (
        todayClasses[0] && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-mono uppercase font-bold tracking-wider">
                Next Scheduled Lecture Today
              </span>
              <h3 className="text-lg font-bold text-white">{todayClasses[0].subject}</h3>
              <p className="text-xs text-slate-400">
                {todayClasses[0].startTime} &ndash; {todayClasses[0].endTime} &bull; Room: {todayClasses[0].room} &bull; Dept: {todayClasses[0].departmentCode}
              </p>
            </div>

            <button
              onClick={() => {
                generateQR(todayClasses[0].id, 180);
                setActiveTab('attendance');
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2 self-start md:self-auto"
            >
              <QrCode className="w-4 h-4" />
              <span>Start Live QR Session</span>
            </button>
          </div>
        )
      )}

      {/* Professor Key Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Classes Scheduled */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Lectures</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{mySlots.length}</span>
            <span className="text-xs text-slate-400">assigned slots</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Today's classes: <strong className="text-slate-200">{todayClasses.length} lectures</strong>
          </p>
          <button
            onClick={() => setActiveTab('timetable')}
            className="text-[11px] text-indigo-400 hover:underline mt-2 flex items-center space-x-1"
          >
            <span>Edit or Reschedule Slots</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Doubts Awaiting Reply */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Inquiries</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{pendingDoubts.length}</span>
            <span className="text-xs text-amber-400 font-bold">pending reply</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Total queries received: <strong className="text-slate-200">{myDoubts.length}</strong>
          </p>
          <button
            onClick={() => setActiveTab('doubts')}
            className="text-[11px] text-cyan-400 hover:underline mt-2 flex items-center space-x-1"
          >
            <span>Open Doubt Inbox</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Course Materials Published */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Repositories</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">
              {mySlots.length > 0 ? '5' : '3'}
            </span>
            <span className="text-xs text-slate-400">active file decks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Includes lecture slides, syllabus, and lab guides
          </p>
          <button
            onClick={() => setActiveTab('materials')}
            className="text-[11px] text-amber-400 hover:underline mt-2 flex items-center space-x-1"
          >
            <span>Upload New Material</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Submissions & Grading */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submissions</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{totalSubmissions}</span>
            <span className="text-xs text-slate-400">student turn-ins</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Active assignments: <strong className="text-slate-200">{myAssignments.length}</strong>
          </p>
          <button
            onClick={() => setActiveTab('materials')}
            className="text-[11px] text-purple-400 hover:underline mt-2 flex items-center space-x-1"
          >
            <span>Review & Grade Works</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Professor's Weekly Schedule Preview */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Assigned Lecture Slots (Weekly)</span>
            </h3>
            <p className="text-xs text-slate-400">You can reschedule or modify these anytime in the Timetable Editor.</p>
          </div>
          <button
            onClick={() => setActiveTab('timetable')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Open Timetable Editor</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mySlots.map((slot) => (
            <div
              key={slot.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400">{slot.day}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    slot.status === 'Live Now'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : slot.status === 'Cancelled'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {slot.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">{slot.subject}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{slot.code} &bull; {slot.departmentCode}</p>
                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <p className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{slot.startTime} &ndash; {slot.endTime}</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-white font-medium">{slot.room}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    generateQR(slot.id, 180);
                    setActiveTab('attendance');
                  }}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Launch QR</span>
                </button>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Edit Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
