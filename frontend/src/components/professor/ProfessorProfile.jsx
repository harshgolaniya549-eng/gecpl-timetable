import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  School,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const ProfessorProfile = () => {
  const { currentUser, timetable } = useApp();

  const mySlots = timetable.filter(
    (s) => s.professorEmail === currentUser?.email || s.professorId === currentUser?.id
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Identity Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {currentUser?.avatar ? (
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-2xl shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 ring-4 ring-indigo-500/30 shadow-2xl shrink-0">
              <User className="w-12 h-12 text-indigo-400" />
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-white">{currentUser?.name}</h2>
                <p className="text-xs text-indigo-400 font-mono font-bold tracking-wider">
                  FACULTY ID: {currentUser?.facultyId}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 self-center sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 animate-pulse" />
                Senior Faculty Member
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              {currentUser?.designation} &bull; {currentUser?.department}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-500 mr-1.5">Office:</span>
                <strong className="text-white">{currentUser?.office}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-500 mr-1.5">Assigned Lectures:</span>
                <strong className="text-emerald-400">{mySlots.length} Slots/Week</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-500 mr-1.5">Experience:</span>
                <strong className="text-amber-400">{currentUser?.experience || '10+ Years'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Research & Academic Specialization */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <School className="w-4 h-4 text-indigo-400" />
            <span>Academic Profile & Specialization</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Research Specialization</span>
              <strong className="text-white text-sm">{currentUser?.specialization}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Office Hours / Cabin Consultation</span>
              <strong className="text-cyan-400">{currentUser?.cabinHours}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Department Dean Standing</span>
              <strong className="text-emerald-400">Senior Academic Council</strong>
            </div>
          </div>
        </div>

        {/* Faculty Contact & Security */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Faculty Contact Details</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-slate-400 flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Faculty Email</span>
              </span>
              <strong className="text-white font-mono">{currentUser?.email}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-slate-400 flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Intercom / Phone</span>
              </span>
              <strong className="text-white font-mono">{currentUser?.phone}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-slate-400 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Campus Location</span>
              </span>
              <strong className="text-white">{currentUser?.office}</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
