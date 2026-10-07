import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Edit3,
  XCircle,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  Save,
  Radio,
  Layers,
  User,
  Coffee
} from 'lucide-react';

export const TimetableEditor = () => {
  const {
    timetable,
    updateSlot,
    cancelSlot,
    addSlot,
    deleteSlot,
    saveTimetableChanges,
    loadBatchTimetable,
    currentUser
  } = useApp();

  const [selectedBatch, setSelectedBatch] = useState('CP1');
  const [viewScope, setViewScope] = useState('all'); // 'all' or 'mine'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Faculty on academic assignment');
  const [isSavingDb, setIsSavingDb] = useState(false);

  // Form states for editing
  const [editDay, setEditDay] = useState('Monday');
  const [editStartTime, setEditStartTime] = useState('10:30 AM');
  const [editEndTime, setEditEndTime] = useState('11:30 AM');
  const [editSubject, setEditSubject] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editFaculty, setEditFaculty] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('Scheduled');
  const [editBatch, setEditBatch] = useState('CP1');

  // Form states for adding new slot
  const [newDay, setNewDay] = useState('Monday');
  const [newStartTime, setNewStartTime] = useState('10:30 AM');
  const [newEndTime, setNewEndTime] = useState('11:30 AM');
  const [newSubject, setNewSubject] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newRoom, setNewRoom] = useState('Room 8109 (Lab 1)');
  const [newFaculty, setNewFaculty] = useState(currentUser?.name || 'DR. R. H. JAISWAL');
  const [newBatch, setNewBatch] = useState('CP1');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const batches = ['CP1', 'CP2', 'CP3', 'All'];

  const profNameUpper = (currentUser?.name || '').toUpperCase();
  const profEmail = currentUser?.email || '';

  useEffect(() => {
    if (loadBatchTimetable && selectedBatch && selectedBatch !== 'All') {
      loadBatchTimetable(selectedBatch);
    }
  }, [selectedBatch]);

  // Filter slots based on batch and scope
  const filteredSlots = timetable.filter((slot) => {
    // Batch filter
    if (selectedBatch !== 'All' && slot.batch && slot.batch !== selectedBatch) {
      return false;
    }
    // Scope filter (mine vs all)
    if (viewScope === 'mine') {
      const slotFaculty = (slot.faculty || slot.facultyName || '').toUpperCase();
      const matchName = profNameUpper && slotFaculty.includes(profNameUpper);
      const matchEmail = slot.professorEmail === profEmail || slot.professorId === currentUser?.id;
      return matchName || matchEmail;
    }
    return true;
  });

  const openEditModal = (slot) => {
    setSelectedSlot(slot);
    setEditDay(slot.day || 'Monday');
    setEditStartTime(slot.startTime || '10:30 AM');
    setEditEndTime(slot.endTime || '11:30 AM');
    setEditSubject(slot.subject || '');
    setEditCode(slot.code || '');
    setEditRoom(slot.room || '');
    setEditFaculty(slot.faculty || slot.facultyName || currentUser?.name || '');
    setEditNotes(slot.notes || '');
    setEditStatus(slot.status || 'Scheduled');
    setEditBatch(slot.batch || selectedBatch || 'CP1');
    setIsEditModalOpen(true);
  };

  const openCancelModal = (slot) => {
    setSelectedSlot(slot);
    setIsCancelModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    updateSlot(selectedSlot.id, {
      day: editDay,
      startTime: editStartTime,
      endTime: editEndTime,
      time: `${editStartTime} to ${editEndTime}`,
      subject: editSubject,
      code: editCode,
      room: editRoom,
      faculty: editFaculty,
      batch: editBatch,
      notes: editNotes,
      status: editStatus === 'Scheduled' && (editDay !== selectedSlot.day || editStartTime !== selectedSlot.startTime) ? 'Rescheduled' : editStatus
    });

    setIsEditModalOpen(false);
  };

  const handleConfirmCancel = () => {
    if (!selectedSlot) return;
    cancelSlot(selectedSlot.id, cancelReason);
    setIsCancelModalOpen(false);
  };

  const handleAddNewSlot = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    addSlot({
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      time: `${newStartTime} to ${newEndTime}`,
      subject: newSubject.trim(),
      code: newCode.trim() || 'CE-301',
      room: newRoom.trim() || 'Room 8109',
      faculty: newFaculty.trim() || currentUser?.name || 'Faculty',
      batch: newBatch,
      status: 'Scheduled',
      notes: ''
    });

    // Reset and close
    setNewSubject('');
    setNewCode('');
    setIsAddModalOpen(false);
  };

  const handleSaveToDatabase = async () => {
    setIsSavingDb(true);
    const targetBatch = selectedBatch === 'All' ? 'CP1' : selectedBatch;
    try {
      await saveTimetableChanges(targetBatch);
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleBatchChange = (b) => {
    setSelectedBatch(b);
    if (b !== 'All' && loadBatchTimetable) {
      loadBatchTimetable(b);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Control Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Interactive Timetable Manager</h2>
          </div>
          <p className="text-xs text-slate-400">
            Edit lecture times, assign rooms, add or cancel slots. Saturday and Sunday are official weekend holidays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Slot</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={isSavingDb}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSavingDb ? 'animate-spin' : ''}`} />
            <span>{isSavingDb ? 'Saving...' : 'Save to Database'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Batch Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Batch:
          </span>
          {batches.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => handleBatchChange(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBatch === b
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {b === 'All' ? 'All Batches' : `Batch ${b}`}
            </button>
          ))}
        </div>

        {/* Scope Toggle: All Lectures vs My Assigned Lectures */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewScope('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewScope === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Lectures ({timetable.length})
          </button>
          <button
            type="button"
            onClick={() => setViewScope('mine')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewScope === 'mine'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Lectures
          </button>
        </div>
      </div>

      {/* Official Weekend Notice */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center space-x-2.5">
          <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Official Schedule Notice:</strong> Saturday & Sunday are designated non-teaching weekend holidays across all batches.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
          Weekend Off
        </span>
      </div>

      {/* Weekdays Matrix (Monday to Friday) */}
      <div className="space-y-6">
        {daysOfWeek.map((day) => {
          const slotsForDay = filteredSlots.filter((s) => s.day === day);

          return (
            <div
              key={day}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-white">{day}</span>
                  <span className="text-xs text-slate-500">
                    ({slotsForDay.length} {slotsForDay.length === 1 ? 'slot' : 'slots'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewDay(day);
                    setIsAddModalOpen(true);
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add slot on {day}</span>
                </button>
              </div>

              {slotsForDay.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/40">
                  No lecture slots scheduled for {day} in current view.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slotsForDay.map((slot) => {
                    const isCancelled = slot.status === 'Cancelled';
                    const isRescheduled = slot.status === 'Rescheduled';
                    const isLive = slot.status === 'Live Now';

                    return (
                      <div
                        key={slot.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isLive
                            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-600/10'
                            : isCancelled
                            ? 'bg-rose-950/20 border-rose-900/40 opacity-75'
                            : isRescheduled
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-indigo-400">
                              {slot.code || 'CE-301'} {slot.batch ? `• Batch ${slot.batch}` : ''}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isLive
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isCancelled
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : isRescheduled
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {slot.status || 'Scheduled'}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                            {slot.subject}
                          </h4>

                          <div className="space-y-1.5 text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 mb-3">
                            <p className="flex items-center space-x-1.5">
                              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{slot.time || `${slot.startTime} – ${slot.endTime}`}</span>
                            </p>
                            <p className="flex items-center space-x-1.5">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="text-white font-medium">{slot.room}</span>
                            </p>
                            <p className="flex items-center space-x-1.5">
                              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="text-slate-300 font-medium">
                                {slot.faculty || slot.facultyName || 'Faculty In-Charge'}
                              </span>
                            </p>
                          </div>

                          {slot.notes && (
                            <p className="text-[11px] text-slate-400 italic mb-3">
                              "{slot.notes}"
                            </p>
                          )}
                        </div>

                        {/* Actions: Edit / Cancel / Delete */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(slot)}
                            className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {!isCancelled ? (
                            <button
                              type="button"
                              onClick={() => openCancelModal(slot)}
                              className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                              title="Cancel lecture"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateSlot(slot.id, { status: 'Scheduled', notes: '' })}
                              className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                            >
                              Restore
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete slot "${slot.subject}" permanently?`)) {
                                deleteSlot(slot.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800/80 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer"
                            title="Delete slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Lecture Slot Modal */}
      {isEditModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Edit Lecture Slot</h3>
                  <p className="text-[11px] text-slate-400">{selectedSlot.code} &bull; {selectedSlot.subject}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Tag
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Live Now">Live Now</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="e.g. Programming for Problem Solving"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="e.g. PPS (3110003)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Batch
                  </label>
                  <select
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CP1">Batch CP1</option>
                    <option value="CP2">Batch CP2</option>
                    <option value="CP3">Batch CP3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Classroom / Lab Location
                  </label>
                  <input
                    type="text"
                    required
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    placeholder="e.g. Room 8109 (Lab 1)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Faculty In-Charge
                  </label>
                  <input
                    type="text"
                    value={editFaculty}
                    onChange={(e) => setEditFaculty(e.target.value)}
                    placeholder="e.g. DR. R. H. JAISWAL"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notice / Agenda for Students
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Room relocated to Computer Center Lab 2..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Slot</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Add New Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Add New Lecture / Lab Slot</h3>
                  <p className="text-[11px] text-slate-400">Add an academic session to the departmental timetable</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewSlot} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Batch
                  </label>
                  <select
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CP1">Batch CP1</option>
                    <option value="CP2">Batch CP2</option>
                    <option value="CP3">Batch CP3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Advanced Data Structures"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject / Course Code
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. ADS (3130702)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. Room 8109 (Lab 1)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Faculty
                  </label>
                  <input
                    type="text"
                    required
                    value={newFaculty}
                    onChange={(e) => setNewFaculty(e.target.value)}
                    placeholder="Faculty name"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slot</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Cancel Lecture Notice Modal */}
      {isCancelModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Cancel Lecture Slot?</h3>
              <p className="text-xs text-slate-400">
                Cancel {selectedSlot.code} on {selectedSlot.day} ({selectedSlot.startTime}). Enrolled students will receive a cancellation alert.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason / Note for Students:
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Faculty academic leave / Lab maintenance"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
