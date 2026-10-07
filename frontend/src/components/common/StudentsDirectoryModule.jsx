import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Users,
  Search,
  GraduationCap,
  Mail,
  School,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Hash,
  ArrowRight
} from 'lucide-react';

export const StudentsDirectoryModule = () => {
  const { currentUser, setActiveTab, loadBatchTimetable, addToast } = useApp();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const batches = ['All', 'CP1', 'CP2', 'CP3'];

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStudents(selectedBatch === 'All' ? null : selectedBatch, searchQuery);
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Could not fetch student records from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBatch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleInspectBatchTimetable = (batch) => {
    if (loadBatchTimetable) {
      loadBatchTimetable(batch);
    }
    setActiveTab('timetable');
    if (addToast) {
      addToast(`Switched timetable view to Batch ${batch}`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-800">Class Student Directory</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                MongoDB Live Roster
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Computer Engineering &bull; First Semester &bull; Government Engineering College Palanpur
            </p>
          </div>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Batch Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {batches.map((batch) => (
            <button
              key={batch}
              onClick={() => setSelectedBatch(batch)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedBatch === batch
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {batch === 'All' ? 'All Batches (78)' : `Batch ${batch} ${batch === 'CP3' ? '(28)' : '(25)'}`}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll (e.g. CE01, CE52)..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
          />
        </div>

      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>Failed to connect to database: {error}</span>
          <button
            onClick={fetchStudents}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : students.length > 0 ? (
        /* Students Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const isCurrentUser = currentUser?.rollNo === student.roll_number || currentUser?.enrollment === student.user_id;

            return (
              <div
                key={student._id || student.roll_number}
                className={`p-5 rounded-2xl bg-white border transition-all hover:shadow-md flex flex-col justify-between ${
                  isCurrentUser
                    ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                        alt={student.student_name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-bold text-slate-800 truncate" title={student.student_name}>
                            {student.student_name}
                          </h4>
                        </div>
                        <p className="text-xs text-blue-600 font-mono font-bold">
                          {student.roll_number}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {student.batch}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <p className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{student.email || `${student.roll_number.toLowerCase()}@gecp.ac.in`}</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{student.program || "First Semester Computer Engineering"}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Sr No. {student.sr_no || student.roll_number?.replace(/\D/g, '')}
                  </span>

                  <button
                    onClick={() => handleInspectBatchTimetable(student.batch)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 group cursor-pointer"
                  >
                    <span>View {student.batch} Schedule</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No students found matching your criteria. Try adjusting your batch or search query.
        </div>
      )}

      {/* Institutional Footer Tag */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Displaying {students.length} verified enrolled students from MongoDB <code>students</code> collection.</span>
        <span className="font-semibold text-slate-700">All student credentials authenticated via batch enrollment records.</span>
      </div>

    </div>
  );
};
