import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  ExternalLink,
  Send,
  X,
  Filter,
  Flag,
  User,
  BookOpen
} from 'lucide-react';

export const DoubtManagement = () => {
  const { doubts, replyDoubt, currentUser } = useApp();
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Pending' | 'Answered'
  const [activeReplyDoubt, setActiveReplyDoubt] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');

  const profEmail = currentUser?.email || 'dr.sharma@college.edu';

  // Filter doubts for this professor
  const myDoubts = doubts.filter((d) => d.professorEmail === profEmail);

  // Extract unique courses in professor doubts
  const uniqueCourses = ['All', ...new Set(myDoubts.map((d) => d.courseCode))];

  const filteredDoubts = myDoubts.filter((d) => {
    const matchesCourse = filterCourse === 'All' || d.courseCode === filterCourse;
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
    return matchesCourse && matchesStatus;
  });

  const handleOpenReply = (doubt) => {
    setActiveReplyDoubt(doubt);
    setAnswerText(doubt.answerText || '');
    setReferenceUrl(doubt.referenceUrl || '');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!answerText.trim() || !activeReplyDoubt) return;

    replyDoubt(activeReplyDoubt.id, answerText, referenceUrl);
    setActiveReplyDoubt(null);
    setAnswerText('');
    setReferenceUrl('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Academic Doubt Inbox</h2>
          </div>
          <p className="text-xs text-slate-400">
            Address technical queries raised by students across your lecture courses.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['All', 'Pending', 'Answered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Course Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {uniqueCourses.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c === 'All' ? 'All Courses' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doubts List */}
      {filteredDoubts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">All Doubts Clear!</h4>
          <p className="text-xs text-slate-500 mt-1">
            No student inquiries pending in this filter category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => {
            const isAnswered = doubt.status === 'Answered';

            return (
              <div
                key={doubt.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {doubt.courseCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {doubt.courseName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1 ${
                        doubt.priority === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : doubt.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Flag className="w-2.5 h-2.5" />
                      <span>{doubt.priority} Priority</span>
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1.5 ${
                        isAnswered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isAnswered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Answered</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Needs Reply</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Question Info */}
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{doubt.topic}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                    {doubt.question}
                  </p>
                  <div className="mt-2 flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <User className="w-3 h-3 text-indigo-400" />
                      <span>From: <strong>{doubt.studentName}</strong> ({doubt.enrollment})</span>
                    </span>
                    <span>&bull;</span>
                    <span>{doubt.createdAt}</span>
                  </div>
                </div>

                {/* Reply section or button */}
                {isAnswered ? (
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-300">Your Response:</span>
                      <button
                        onClick={() => handleOpenReply(doubt)}
                        className="text-xs text-indigo-400 hover:underline font-semibold"
                      >
                        Edit Reply
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200">{doubt.answerText}</p>
                    {doubt.referenceUrl && (
                      <a
                        href={doubt.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium pt-1"
                      >
                        <span>Attached Reference</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleOpenReply(doubt)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply to Student</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {activeReplyDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Answer Student Query</h3>
              </div>
              <button
                onClick={() => setActiveReplyDoubt(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="p-6 space-y-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <span className="text-slate-500 font-mono">Question from {activeReplyDoubt.studentName}:</span>
                <p className="text-white font-medium mt-1">"{activeReplyDoubt.topic}"</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Faculty Solution & Explanation
                </label>
                <textarea
                  rows={4}
                  required
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Provide technical clarification, algorithm rationale, or step-by-step guidance..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Reference Link (PDF / Docs / GitHub)
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveReplyDoubt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Response</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
