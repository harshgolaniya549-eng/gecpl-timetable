import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import {
  QrCode,
  Users,
  Clock,
  Sparkles,
  RefreshCw,
  XCircle,
  Play,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  School,
  Send,
  Copy,
  Check,
  Radio,
  Layers
} from 'lucide-react';

export const LiveAttendanceManager = () => {
  const {
    timetable,
    activeQR,
    generateQR,
    closeQR,
    attendanceLogs,
    currentUser,
    addToast
  } = useApp();

  const [selectedSlotId, setSelectedSlotId] = useState(
    timetable[0]?.id || ''
  );
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [duration, setDuration] = useState(180); // 3 minutes default
  const [copied, setCopied] = useState(false);

  const profNameUpper = (currentUser?.name || '').toUpperCase();
  const profEmail = currentUser?.email || '';

  // Get available slots with batch filter
  const availableSlots = timetable.filter((slot) => {
    if (selectedBatch !== 'All' && slot.batch && slot.batch !== selectedBatch) {
      return false;
    }
    return true;
  });

  const activeSlot = timetable.find((s) => s.id === activeQR?.slotId);

  // Real-time roster of students who checked into active lecture
  const checkedInStudents = attendanceLogs.filter(
    (log) => log.lectureId === activeQR?.slotId
  );

  const handleStartQR = () => {
    const targetId = selectedSlotId || availableSlots[0]?.id || timetable[0]?.id;
    if (!targetId) return;
    const newQR = generateQR(targetId, duration);
    if (addToast) {
      addToast('Online Attendance QR code successfully sent to all enrolled students!', 'success');
    }
  };

  const handleRegenerate = () => {
    if (activeQR?.slotId) {
      generateQR(activeQR.slotId, duration);
      if (addToast) {
        addToast('Regenerated new security token & broadcasted to students!', 'info');
      }
    }
  };

  const handleBroadcastPush = () => {
    if (!activeQR) return;
    try {
      localStorage.setItem('GEC_ACTIVE_QR', JSON.stringify(activeQR));
      window.dispatchEvent(new CustomEvent('GEC_QR_BROADCAST', { detail: activeQR }));
      if (addToast) {
        addToast(`Broadcast ping sent to students for ${activeQR.subject}!`, 'success');
      }
    } catch (e) {}
  };

  const handleCopyToken = () => {
    if (!activeQR?.token) return;
    navigator.clipboard.writeText(activeQR.token);
    setCopied(true);
    if (addToast) {
      addToast('Attendance verification code copied to clipboard!', 'info');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">

      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Online Attendance & Live QR Broadcast</h2>
          </div>
          <p className="text-xs text-slate-400">
            Generate and send encrypted attendance QR codes directly to students in real time.
          </p>
        </div>

        {activeQR?.active ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBroadcastPush}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-colors cursor-pointer"
              title="Resend broadcast alert to student portals"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Resend QR to Students</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              onClick={closeQR}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: QR Code Projection & Session Controls */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col items-center text-center">

          {activeQR?.active ? (
            <div className="w-full space-y-4">
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
                  LIVE BROADCAST ACTIVE
                </span>
                <h3 className="text-lg font-black text-white">{activeQR.subject}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {activeQR.code} &bull; Room: {activeQR.room}
                </p>
              </div>

              {/* QR Code Component */}
              <div className="py-2 flex justify-center">
                <QRCodeDisplay
                  qrData={activeQR}
                  size={240}
                  onRegenerate={handleRegenerate}
                  onExpire={() => { }}
                />
              </div>

              {/* Attendance Token / Passcode Box with Copy */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                    Security Token / Code for Students
                  </span>
                  <span className="font-mono text-sm font-bold text-indigo-300 select-all">
                    {activeQR.token}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 text-left flex items-start space-x-2">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[11px] leading-relaxed">
                  Students logged in on their laptops or mobile phones see a real-time pulsing <strong>"Live QR Attendance Active"</strong> notification in their header bar and can submit attendance instantly.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-5 text-left">
              <div className="text-center sm:text-left">
                <h3 className="text-base font-bold text-white mb-1">Initiate & Send Attendance QR</h3>
                <p className="text-xs text-slate-400">
                  Select a lecture slot and duration to send a live attendance QR code to students.
                </p>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Filter by Batch
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['All', 'CP1', 'CP2', 'CP3'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBatch(b)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedBatch === b
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {b === 'All' ? 'All Batches' : b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Lecture Slot ({availableSlots.length} available)
                </label>
                <select
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.day} &ndash; {slot.code || 'CE'} &bull; {slot.subject} ({slot.time || slot.startTime}) {slot.batch ? `[Batch ${slot.batch}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  QR Token Validity Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '60 Seconds', val: 60 },
                    { label: '3 Minutes', val: 180 },
                    { label: '5 Minutes', val: 300 },
                  ].map((dur) => (
                    <button
                      key={dur.val}
                      type="button"
                      onClick={() => setDuration(dur.val)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        duration === dur.val
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                <p className="font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real-Time Broadcast & Anti-Proxy Security</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Clicking below immediately alerts connected students and broadcasts the active token across student dashboards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartQR}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send & Broadcast Online Attendance QR</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Live Attendance Roster List */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Live Student Check-Ins</h3>
                <p className="text-xs text-slate-400">
                  {checkedInStudents.length} verified attendance submissions
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {checkedInStudents.length} Present
              </span>
            </div>
          </div>

          {checkedInStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Waiting for student scans... Check-ins will appear here in real time.</p>
              <p className="text-[11px] text-slate-600">
                (Students will see a live QR alert banner and can mark attendance in 1 click)
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 max-h-[420px] overflow-y-auto pr-1">
              {checkedInStudents.map((student) => (
                <div key={student.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                      {student.studentName ? student.studentName[0] : 'S'}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{student.studentName}</h5>
                      <p className="text-xs text-indigo-400 font-mono">{student.enrollment}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {student.status}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{student.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
