import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  QrCode,
  Calendar,
  Sparkles,
  CheckCircle2,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { ScanAttendanceModal } from '../common/PortalModals';

export const TimetableModule = () => {
  const { timetable, currentUser, loadBatchTimetable, addToast, activeQR } = useApp();
  const [selectedBatch, setSelectedBatch] = useState(currentUser?.batch || 'CP1');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDayName, setCurrentDayName] = useState('');

  const batches = ['CP1', 'CP2', 'CP3'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'];

  // Sync selectedBatch if currentUser has a batch
  useEffect(() => {
    if (currentUser?.batch) {
      setSelectedBatch(currentUser.batch);
    }
  }, [currentUser?.batch]);

  // Automatically ensure batch timetable is loaded on mount or batch change
  useEffect(() => {
    if (loadBatchTimetable && selectedBatch) {
      loadBatchTimetable(selectedBatch);
    }
  }, [selectedBatch]);

  // Live real-time clock (Google / Indian Standard Time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[now.getDay()];
      setCurrentDayName(today);
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' • ' + now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Default day to today (including Saturday and Sunday)
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    setSelectedDay(today);
  }, []);

  const handleBatchChange = async (batch) => {
    setSelectedBatch(batch);
    setLoadingBatch(true);
    try {
      if (loadBatchTimetable) {
        await loadBatchTimetable(batch);
      }
      if (addToast) addToast(`Loaded real timetable for Batch ${batch}`, 'success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBatch(false);
    }
  };

  const isSlotCurrentlyActive = (slot) => {
    // If professor has actively broadcast attendance QR for this slot right now
    if (activeQR?.active && (activeQR.slotId === slot.id || activeQR.code === slot.code)) return true;

    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[now.getDay()];
    if (today === 'Saturday' || today === 'Sunday') return false;
    if (slot.day !== today) return false;

    try {
      const rawTime = slot.time || slot.timeStr || `${slot.startTime || ''} to ${slot.endTime || ''}`;
      const sep = rawTime.includes('to') ? 'to' : (rawTime.includes('–') ? '–' : (rawTime.includes('-') ? '-' : null));
      if (!sep) return false;
      const [startStr, endStr] = rawTime.split(sep).map((s) => s.trim());

      const parseToMinutes = (str) => {
        let [time, mod] = str.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (isNaN(h)) return 0;
        m = isNaN(m) ? 0 : m;
        if (mod) {
          if (mod.toUpperCase() === 'PM' && h < 12) h += 12;
          if (mod.toUpperCase() === 'AM' && h === 12) h = 0;
        } else {
          if (h >= 1 && h <= 6) h += 12; // PM afternoon class
        }
        return h * 60 + m;
      };

      const start = parseToMinutes(startStr);
      const end = parseToMinutes(endStr);
      const current = now.getHours() * 60 + now.getMinutes();
      return current >= start && current < end;
    } catch {
      return false;
    }
  };

  const isWeekend = selectedDay === 'Saturday' || selectedDay === 'Sunday';

  const batchSlots = timetable.filter((slot) => !slot.batch || slot.batch === selectedBatch);
  const slotsForBatch = batchSlots.length > 0 ? batchSlots : timetable;
  const filteredSlots = slotsForBatch.filter((slot) => {
    return selectedDay === 'All' || slot.day === selectedDay;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-800">Class Timetable & Schedule</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-50 text-purple-700 border border-purple-100">
                Batch {selectedBatch}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Government Engineering College Palanpur &bull; Computer Engineering Department
            </p>
          </div>
        </div>

        {/* Real-time Clock & Attendance Trigger */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {currentTimeStr && (
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold">{currentTimeStr}</span>
            </div>
          )}

          <button
            onClick={() => setQrModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* Batch Switcher & Day Tabs Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Batch Switcher Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs self-start">
          <span className="text-xs font-bold text-slate-400 px-2.5 uppercase tracking-wider font-mono">
            Batch:
          </span>
          {batches.map((b) => (
            <button
              key={b}
              onClick={() => handleBatchChange(b)}
              disabled={loadingBatch}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBatch === b
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {daysOfWeek.map((day) => {
            const isDayHoliday = day === 'Saturday' || day === 'Sunday';
            const isToday = currentDayName === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                  selectedDay === day
                    ? isDayHoliday
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'bg-blue-600 text-white shadow-xs font-bold'
                    : isDayHoliday
                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100/70 border border-amber-200/80'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{day}</span>
                {isDayHoliday && (
                  <span className="text-[10px] px-1 rounded bg-black/10">Off</span>
                )}
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Weekend Holiday Card (Requirement 5: Saturday & Sunday as Holiday) */}
      {isWeekend ? (
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border border-amber-200/80 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner text-3xl">
            🏖️
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-200/70 text-amber-900 uppercase tracking-wider mb-2">
              <Coffee className="w-3.5 h-3.5" />
              <span>Official College Holiday</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">
              {selectedDay} &bull; Weekend Holiday
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
              Academic lectures, tutorials, and practical laboratories are suspended on Saturdays and Sundays as per the official GTU academic schedule.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-medium">
            <span className="px-3 py-1 rounded-lg bg-white border border-amber-200">
              🏛️ Campus Administrative Office: Closed
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-amber-200">
              📖 Digital Library & PDFs: 24/7 Available
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-amber-200">
              📅 Next Class: Monday at 10:30 AM
            </span>
          </div>
        </div>
      ) : (
        /* Regular Weekday Schedule Table */
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              {selectedDay === 'All' ? 'All Week Sessions' : `${selectedDay}'s Classes`} ({filteredSlots.length} sessions for Batch {selectedBatch})
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Department of Computer Engineering &bull; Live Sync
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredSlots.length > 0 ? (
              filteredSlots.map((slot) => {
                const isLive = isSlotCurrentlyActive(slot);

                return (
                  <div
                    key={slot.id}
                    className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isLive ? 'bg-blue-50/50 px-3.5 rounded-xl border border-blue-200/80 my-1 shadow-2xs' : ''
                    }`}
                  >
                    <div className="flex items-start sm:items-center space-x-4">
                      <div className="w-28 text-slate-600 font-mono text-xs font-bold whitespace-nowrap flex items-center space-x-1.5">
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${isLive ? 'text-blue-600 animate-spin' : 'text-slate-400'}`} />
                        <span>{slot.time || slot.timeStr}</span>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">{slot.subject}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                            {slot.code}
                          </span>
                          {slot.type === 'Lab' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              PRACTICAL / LAB
                            </span>
                          )}
                          {isLive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Live Now (Real-Time)</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Faculty: <strong className="text-slate-600 font-medium">{slot.faculty || slot.facultyName || slot.professorName || "Department Faculty"}</strong>
                          {selectedDay === 'All' && <span className="ml-2 font-semibold text-indigo-500 font-mono">({slot.day})</span>}
                          {slot.notes && <span className="ml-2 italic text-slate-400">&bull; {slot.notes}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 self-end sm:self-auto">
                      <div className="flex items-center space-x-1 text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{slot.room}</span>
                      </div>

                      {isLive && (
                        <button
                          onClick={() => setQrModalOpen(true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center space-x-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Mark Attendance</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No classes scheduled for {selectedDay} in Batch {selectedBatch}.
              </div>
            )}
          </div>
        </div>
      )}

      <ScanAttendanceModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

    </div>
  );
};
