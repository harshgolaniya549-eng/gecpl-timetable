import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Calendar,
  FileText,
  BookOpen,
  Megaphone,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  CalendarDays,
  QrCode,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Radio,
  Video,
  Play,
  User,
  Users,
  X,
  Volume2,
  Maximize2,
  MapPin,
  Laptop
} from 'lucide-react';
import {
  SubmitAssignmentModal,
  ScanAttendanceModal
} from '../common/PortalModals';

export const StudentDashboardView = () => {
  const {
    currentUser,
    timetable,
    assignments,
    notices,
    recentActivity,
    attendanceSummary,
    setActiveTab,
    hod,
    activeQR,
    loadBatchTimetable
  } = useApp();

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAsgId, setSelectedAsgId] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [liveLectureModalOpen, setLiveLectureModalOpen] = useState(false);

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [nowDate, setNowDate] = useState(new Date());

  // Live Google/IST network clock - ticks every second for real-time reactivity
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setNowDate(d);
      setCurrentTimeStr(
        d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' • ' + d.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nowDate.getDay()];
  const isWeekend = currentDayName === 'Saturday' || currentDayName === 'Sunday';
  const curMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  // Helper to parse time strings like "10:30 to 11:30", "01:00 to 02:00", "03:10 to 04:10"
  const parseTimeToMinutes = (str) => {
    if (!str) return null;
    const clean = str.trim();
    const [timePart, meridiem] = clean.split(' ');
    if (!timePart) return null;
    let [h, m] = timePart.split(':').map(Number);
    if (isNaN(h)) return null;
    m = isNaN(m) ? 0 : m;
    if (meridiem) {
      const mer = meridiem.toUpperCase();
      if (mer === 'PM' && h < 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
    } else {
      // Indian college standard: 10, 11 are AM; 12 is PM; 01, 02, 03, 04, 05 are PM.
      if (h >= 1 && h <= 6) h += 12;
    }
    return h * 60 + m;
  };

  const getSlotRange = (slot) => {
    const rawTime = slot.time || slot.timeStr || `${slot.startTime || ''} to ${slot.endTime || ''}`;
    const sep = rawTime.includes('to') ? 'to' : (rawTime.includes('–') ? '–' : (rawTime.includes('-') ? '-' : null));
    if (!sep) return null;
    const [startPart, endPart] = rawTime.split(sep).map(s => s.trim());
    const startMin = parseTimeToMinutes(startPart);
    const endMin = parseTimeToMinutes(endPart);
    if (startMin === null || endMin === null) return null;
    return { startMin, endMin };
  };

  // Student details
  const student = currentUser || {
    name: "Harshadkumar Bharatbhai Koli",
    department: "Computer Engineering",
    year: "1st Year",
    semester: 1,
    rollNo: "CE52",
    enrollment: "CE52",
    batch: "CP3",
    academicYear: "2026 - 2027",
    college: "Government Engineering College Palanpur"
  };

  // Automatically ensure batch timetable is loaded if empty or missing slots
  useEffect(() => {
    const batch = student.batch || 'CP1';
    if (loadBatchTimetable && (!timetable || timetable.length === 0 || !timetable.some(t => t.day === currentDayName))) {
      loadBatchTimetable(batch);
    }
  }, [student.batch, timetable?.length, currentDayName]);

  // Slots for today's day of week, filtered for this student's batch
  const batchMatches = timetable.filter((t) => !t.batch || t.batch === student.batch);
  const activeTimetable = batchMatches.length > 0 ? batchMatches : timetable;
  const todayClasses = activeTimetable.filter((t) => t.day === currentDayName);

  // Check if a slot is ACTUALLY active in real time right now
  const isSlotActiveNow = (slot) => {
    if (isWeekend) return false;
    // If professor has actively broadcast attendance QR for this slot right now
    if (activeQR?.active && (activeQR.slotId === slot.id || activeQR.code === slot.code)) return true;
    if (slot.day && slot.day !== currentDayName) return false;
    const range = getSlotRange(slot);
    if (!range) return false;
    return curMinutes >= range.startMin && curMinutes < range.endMin;
  };

  // ONLY return the lecture if it is ACTUALLY live right now
  const activeLecture = !isWeekend
    ? (todayClasses.find((c) => isSlotActiveNow(c)) || (activeQR?.active ? (todayClasses.find(s => s.id === activeQR.slotId) || timetable.find(s => s.id === activeQR.slotId)) : null) || null)
    : null;

  // Next upcoming lecture today
  const nextUpcomingLecture = !isWeekend
    ? todayClasses.find((c) => {
        const range = getSlotRange(c);
        return range && range.startMin > curMinutes;
      })
    : null;

  const isCollegeOverToday = !isWeekend && curMinutes >= 17 * 60 + 10;
  const isBeforeCollegeStarts = !isWeekend && curMinutes < 10 * 60 + 30;
  const isLunchRecess = !isWeekend && curMinutes >= 750 && curMinutes < 780; // 12:30 to 1:00 PM

  const hodName = hod?.name || "DR. R. H. JAISWAL";

  const attendance = attendanceSummary[student.enrollment] || {
    overall: 87,
    attendedTotal: 58,
    absentTotal: 7,
    totalConducted: 65
  };

  const handleOpenSubmit = (asgId) => {
    setSelectedAsgId(asgId);
    setSubmitModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ================= ROW 1: Prominent Live Lecture Panel & Student Info Card ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Prominent Live Lecture Panel or Weekend Holiday Banner */}
        {isWeekend ? (
          <div className="lg:col-span-8 rounded-2xl bg-gradient-to-br from-[#12162a] via-[#1a1b35] to-[#12162a] text-white border border-amber-500/40 p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-md">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-xl">
                    🏖️
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>{currentDayName} — Weekend Holiday</span>
                    </h2>
                    <p className="text-[11px] text-amber-200/80 font-medium">
                      Government Engineering College Palanpur &bull; Academic Schedule
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                  <span>CAMPUS OFF</span>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur-xs space-y-2">
                <h3 className="text-base font-bold text-white">No Academic Lectures Scheduled Today</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Academic lectures, tutorials, and practical laboratories are suspended on Saturdays and Sundays. Regular timetable classes will resume on Monday at 10:30 AM.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs text-amber-300">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📚 Digital Library Available 24/7</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📝 Assignments Desk Open</span>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('timetable')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  View Full Week Timetable &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('library')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                >
                  Browse Engineering Textbooks
                </button>
              </div>
            </div>
          </div>
        ) : activeLecture ? (
          <div className="lg:col-span-8 rounded-2xl bg-gradient-to-br from-[#0c1f3d] via-[#112a52] to-[#0c1f3d] text-white border border-blue-900/60 p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-md">
            {/* Subtle Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header: "Live Lecture" with Real-Time Status Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>Live Lecture</span>
                    </h2>
                    <p className="text-[11px] text-blue-200 font-medium">
                      Department of Computer Engineering &bull; Active Classroom Session
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>IN PROGRESS NOW</span>
                </div>
              </div>

              {/* Academic Lecture Panel Details */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5 backdrop-blur-xs mt-3 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-0.5">
                      Subject & Course Code
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                      {activeLecture.subject}
                      <span className="text-blue-300 text-xs font-semibold ml-2 font-mono">
                        ({activeLecture.code || 'CE'})
                      </span>
                    </h3>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-0.5">
                      Room / Lab
                    </span>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
                      {activeLecture.room || 'Room 8109'}
                    </span>
                  </div>
                </div>

                {/* Professor Name & Schedule Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-300 block">Faculty In-Charge</span>
                      <strong className="text-white text-xs">{activeLecture.faculty || activeLecture.facultyName || 'Faculty'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-300 block">Lecture Schedule</span>
                      <strong className="text-white text-xs">Today &bull; {activeLecture.time || activeLecture.timeStr}</strong>
                    </div>
                  </div>
                </div>

                {activeLecture.topic && (
                  <div className="pt-2 text-xs text-blue-100 flex items-center space-x-2">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">Current Topic:</span>
                    <span className="font-medium text-white truncate">
                      {activeLecture.topic}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLiveLectureModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Join / View Classroom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Mark Live Attendance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('timetable')}
                  className="px-3.5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-blue-200 border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                >
                  Full Timetable &rarr;
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* When NO lecture is live in real-time right now */
          <div className="lg:col-span-8 rounded-2xl bg-gradient-to-br from-[#0a1832] via-[#0f2347] to-[#0a1832] text-white border border-blue-900/60 p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-md">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xl">
                    {isCollegeOverToday ? '🌙' : (isLunchRecess ? '🍱' : (isBeforeCollegeStarts ? '🌅' : '☕'))}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>
                        {isCollegeOverToday
                          ? "Lectures Concluded For Today"
                          : isBeforeCollegeStarts
                          ? "First Class Starts at 10:30 AM"
                          : isLunchRecess
                          ? "Recess / Lunch Break"
                          : "No Active Lecture Right Now"}
                      </span>
                    </h2>
                    <p className="text-[11px] text-blue-200/80 font-medium">
                      Department of Computer Engineering &bull; Real-Time Academic Schedule
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{currentTimeStr || 'Current Time'}</span>
                </div>
              </div>

              {/* Status Notice Details */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur-xs space-y-3">
                {nextUpcomingLecture ? (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-1">
                      Next Upcoming Lecture Today
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {nextUpcomingLecture.subject}{' '}
                      <span className="text-blue-300 font-normal text-xs font-mono">
                        ({nextUpcomingLecture.code || 'CE'})
                      </span>
                    </h3>
                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Schedule: <strong>{nextUpcomingLecture.time || nextUpcomingLecture.timeStr}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Room: <strong>{nextUpcomingLecture.room || '8109'}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Faculty: <strong>{nextUpcomingLecture.faculty || nextUpcomingLecture.facultyName || 'Faculty In-Charge'}</strong></span>
                      </span>
                    </div>
                  </div>
                ) : isCollegeOverToday ? (
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white">
                      Academic lectures for {currentDayName} are concluded (College Hours: 10:30 AM – 05:10 PM).
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All teaching sessions for today are complete. Classes resume tomorrow at 10:30 AM as per department timetable.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 text-xs text-blue-300">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📚 Digital Library Available 24/7</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📝 Assignment Desk Open</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      No teaching lecture scheduled in this time slot.
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Check your batch timetable for upcoming lab sessions or self-study hours.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('timetable')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  View Full Week Timetable &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('assignments')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                >
                  Check Assignments
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Info Card (Right) with Generic User Icon & HOD Info */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center space-x-3.5 mb-5">
              {/* Generic User Avatar Icon */}
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs shrink-0">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800 leading-tight truncate">
                  {student.department || "Computer Engineering"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Batch {student.batch || "CP3"} &bull; Sem - {student.semester || 1}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-500">
                  <span className="w-4 h-4 text-slate-400 flex items-center justify-center font-mono">#</span>
                  <span>Roll No.</span>
                </div>
                <span className="font-semibold text-slate-800 font-mono">{student.rollNo || "CE52"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-500">
                  <span className="w-4 h-4 text-slate-400 flex items-center justify-center font-mono">ID</span>
                  <span>Enrollment No.</span>
                </div>
                <span className="font-semibold text-slate-800 font-mono">{student.enrollment || "CE52"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Academic Year</span>
                </div>
                <span className="font-semibold text-slate-800">{student.academicYear || "2026 - 2027"}</span>
              </div>

              {/* HOD Field (Requirement 2 & 6: Display HOD name instead of Faculty Advisor) */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2 text-slate-500">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>Head of Dept (HOD)</span>
                </div>
                <span className="font-bold text-indigo-700">{hodName}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="w-full py-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>View Student Academic Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ================= ROW 2: Quick Action Cards ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* 1. Purple: View Time Table */}
        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          className="rounded-2xl p-4 bg-[#7c66f5] hover:bg-[#7058f4] text-white shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-center flex flex-col items-center justify-center group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">View Time Table</span>
          <span className="text-[10px] text-white/80 mt-0.5">Batches CP1, CP2, CP3</span>
        </button>

        {/* 2. Green: Submit Assignment */}
        <button
          type="button"
          onClick={() => setSubmitModalOpen(true)}
          className="rounded-2xl p-4 bg-[#27ae60] hover:bg-[#219653] text-white shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-center flex flex-col items-center justify-center group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">Submit Assignment</span>
          <span className="text-[10px] text-white/80 mt-0.5">Digital Upload Desk</span>
        </button>

        {/* 3. Amber: Engineering Library */}
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className="rounded-2xl p-4 bg-[#f39c12] hover:bg-[#d68910] text-white shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-center flex flex-col items-center justify-center group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">Engineering Library</span>
          <span className="text-[10px] text-white/80 mt-0.5">Reference Books & PDFs</span>
        </button>

      </div>

      {/* ================= ROW 3: Classes, Assignments, Holiday Notices ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Today's Classes (Col 1) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Today&apos;s Lectures</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Batch {student.batch || 'CP3'} Schedule
              </span>
            </div>

            <div className="overflow-x-auto">
              {isWeekend ? (
                <div className="py-6 px-4 text-center bg-amber-50/70 border border-amber-200/80 rounded-xl my-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2 text-lg">
                    🏖️
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Weekend Holiday ({currentDayName})
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Classes and labs are suspended on Saturdays and Sundays. Regular academic timetable resumes on Monday.
                  </p>
                  <span className="inline-block mt-2.5 px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800 text-[10px] font-semibold border border-amber-200">
                    Next Class: Monday 10:30 AM
                  </span>
                </div>
              ) : todayClasses.length === 0 ? (
                <div className="py-6 px-3 text-center bg-slate-50 border border-slate-100 rounded-xl my-2">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">No classes scheduled for {currentDayName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Batch {student.batch || 'CP1'} &bull; Department of Computer Engineering</p>
                  <button
                    type="button"
                    onClick={() => loadBatchTimetable && loadBatchTimetable(student.batch || 'CP1')}
                    className="mt-2.5 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Load Live Schedule &rarr;
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Subject</th>
                      <th className="pb-2 font-medium text-right">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todayClasses.map((c, i) => {
                      const isLive = isSlotActiveNow(c);
                      const range = getSlotRange(c);
                      const isPast = range && range.endMin <= curMinutes;

                      return (
                        <tr
                          key={i}
                          className={`transition-colors ${
                            isLive ? 'bg-emerald-50/80 font-semibold' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-2.5 text-slate-600 font-medium whitespace-nowrap text-[11px]">
                            {c.time || c.timeStr}
                          </td>
                          <td className="py-2.5 pr-2 font-semibold text-slate-800 text-xs">
                            <div className="flex items-center space-x-1.5">
                              <span>{c.subject}</span>
                              {isLive && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                                  Live Now
                                </span>
                              )}
                              {isPast && !isLive && (
                                <span className="text-[10px] text-slate-400 font-normal">Completed</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-medium text-slate-600 text-[11px]">
                            {c.room}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-right">
            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Full Timetable &rarr;
            </button>
          </div>
        </div>

        {/* Upcoming Assignments (Col 2) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Assignments</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {assignments.slice(0, 4).map((asg, idx) => {
                const dateParts = (asg.dueDate || "28 Sep").split(" ");
                const dayNum = dateParts[0];
                const month = dateParts[1] || "Sep";
                
                const badgeColor =
                  idx === 0
                    ? "bg-rose-50 text-rose-600 border-rose-100"
                    : idx === 1
                    ? "bg-blue-50 text-blue-600 border-blue-100"
                    : idx === 2
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-purple-50 text-purple-600 border-purple-100";

                const tagColor =
                  asg.status === "Due Soon"
                    ? "bg-rose-50 text-rose-600"
                    : asg.status === "Submitted"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-blue-50 text-blue-600";

                return (
                  <div
                    key={asg.id}
                    onClick={() => handleOpenSubmit(asg.id)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${badgeColor}`}>
                        <span className="text-[11px] font-bold leading-tight">{dayNum}</span>
                        <span className="text-[9px] font-semibold uppercase leading-none">{month}</span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{asg.subject}</p>
                        <p className="text-[11px] text-slate-400 truncate">{asg.title}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ml-2 whitespace-nowrap ${tagColor}`}>
                      {asg.status || "Upcoming"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="w-full py-1.5 text-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg transition-colors cursor-pointer"
            >
              + Quick Upload Submission
            </button>
          </div>
        </div>

        {/* Holiday Notices (Col 3 - Requirement 5: Only Holiday Notices) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-800">Holiday Notices</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('notices')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View Bulletin
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  onClick={() => setActiveTab('notices')}
                  className="flex items-start justify-between gap-3 text-xs cursor-pointer group p-1.5 rounded-lg hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 font-semibold leading-snug group-hover:text-blue-600 transition-colors truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-amber-600 font-medium">Official Holiday</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono font-medium">
                    {n.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 mt-3 text-right">
            <button
              type="button"
              onClick={() => setActiveTab('notices')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Browse Holiday Calendar &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* ================= ROW 4: Attendance, Recent Activity, Campus Highlight ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Attendance Overview (Col 1) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Attendance Overview</h3>
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              
              {/* Circular Gauge */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${attendance.overall}, 100`}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-800">{attendance.overall}%</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 mt-2">Overall Attendance</span>
              </div>

              {/* Stats Counters */}
              <div className="space-y-2.5 text-xs pr-2">
                <div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Present</span>
                  </div>
                  <p className="text-base font-bold text-slate-800 pl-3.5 mt-0.5">{attendance.attendedTotal}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Absent</span>
                  </div>
                  <p className="text-base font-bold text-slate-800 pl-3.5 mt-0.5">{attendance.absentTotal}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>Total Conducted</span>
                  </div>
                  <p className="text-base font-bold text-slate-800 pl-3.5 mt-0.5">{attendance.totalConducted}</p>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100/70 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Live Attendance QR</span>
            </button>
          </div>
        </div>

        {/* Recent Activity (Col 2) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Recent Activity</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('attendance')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5">
              {recentActivity.slice(0, 4).map((act) => {
                const IconComponent =
                  act.icon === "file-text"
                    ? FileText
                    : act.icon === "bar-chart-2"
                    ? BarChart2
                    : act.icon === "check-circle"
                    ? CheckCircle
                    : Download;

                return (
                  <div key={act.id} className="flex items-start space-x-3 text-xs">
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap w-16 flex-shrink-0">
                      {act.time}
                    </span>
                    <div className="w-4 h-4 text-slate-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-snug">
                      {act.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 mt-2 text-right">
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Logs Active</span>
            </span>
          </div>
        </div>

        {/* Academic Excellence Card (Col 3) */}
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 shadow-xs border border-indigo-800/60 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-cyan-300 border border-white/10 uppercase tracking-wider">
                GEC Palanpur
              </span>
              <GraduationCap className="w-5 h-5 text-cyan-400" />
            </div>

            <h4 className="text-base font-extrabold text-white leading-snug mb-2">
              Engineering Academic Excellence
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maintain minimum 75% attendance for semester examination eligibility. Check holiday bulletins for GTU academic breaks.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Department:</span>
                <span className="font-semibold text-white">Computer Engineering</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Head of Dept:</span>
                <span className="font-bold text-cyan-300">{hodName}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">GTU Code: 061</span>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className="text-cyan-300 hover:text-white font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>Library Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ================= Interactive Live Lecture Viewer Modal ================= */}
      {liveLectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl text-white">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    Live Classroom Stream &bull; {activeLecture.subject}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeLecture.room || 'Room 8109'} &bull; In-Charge: {activeLecture.faculty || 'PROF. K. M. GOHEL'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLiveLectureModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video / Blackboard Simulator */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="relative aspect-video bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner group">
                <div className="absolute top-3 left-3 flex items-center space-x-2 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>LIVE TRANSMISSION</span>
                </div>

                <div className="absolute top-3 right-3 flex items-center space-x-2 text-xs text-slate-400">
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono">
                    <Users className="w-3 h-3 text-blue-400 mr-1" />
                    <span>64 Students Online</span>
                  </span>
                </div>

                {/* Simulated Presentation Screen */}
                <div className="max-w-lg space-y-3">
                  <div className="inline-block p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-1">
                    <Laptop className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {activeLecture.topic || 'Unit 3: Pointers, Arrays & Dynamic Memory Allocation'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Smart whiteboard and audio transmission from Computer Engineering Lab 8109. Professor is presenting slide 14: Heap memory allocation via malloc and free.
                  </p>

                  <div className="pt-2 flex items-center justify-center space-x-2">
                    <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Audio Stream Connected
                    </span>
                    <span className="text-[11px] px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      High Definition 1080p
                    </span>
                  </div>
                </div>
              </div>

              {/* Lecture Metadata & Actions */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Subject In-Charge & HOD:</span>
                  <strong className="text-white">
                    {activeLecture.faculty || 'PROF. K. M. GOHEL'} &bull; HOD: {hodName}
                  </strong>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLiveLectureModalOpen(false);
                      setQrModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan Live Attendance QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLiveLectureModalOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= Interactive Modals (No Fee Pay Modal) ================= */}
      <SubmitAssignmentModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        defaultAsgId={selectedAsgId}
      />

      <ScanAttendanceModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

    </div>
  );
};
