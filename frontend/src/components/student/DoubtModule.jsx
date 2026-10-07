import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  BookOpen,
  X,
  MessageSquare,
  Sparkles,
  Send,
  Flag
} from 'lucide-react';

export const DoubtModule = () => {
  const { doubts, askDoubt, currentUser, timetable } = useApp();
  const [filter, setFilter] = useState('All'); // 'All' | 'Pending' | 'Answered'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedCourseCode, setSelectedCourseCode] = useState('CS401');
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [priority, setPriority] = useState('Medium');

  const enrollment = currentUser?.enrollment || '2024CS101';
  const myDoubts = doubts.filter((d) => d.enrollment === enrollment);

  const filteredDoubts = myDoubts.filter((d) => {
    if (filter === 'All') return true;
    return d.status === filter;
  });

  // Extract unique courses from timetable for student's department
  const uniqueCourses = Array.from(
    new Map(
      timetable.map((s) => [
        s.code,
        {
          code: s.code,
          name: s.subject,
          professorEmail: s.professorEmail,
          professorName: s.professorName,
        },
      ])
    ).values()
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim() || !question.trim()) return;

    const courseObj = uniqueCourses.find((c) => c.code === selectedCourseCode) || uniqueCourses[0];

    askDoubt({
      courseCode: courseObj.code,
      courseName: courseObj.name,
      topic,
      question,
      priority,
      professorEmail: courseObj.professorEmail,
      professorName: courseObj.professorName,
    });

    setTopic('');
    setQuestion('');
    setPriority('Medium');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Academic Doubt Resolution Desk</h2>
          </div>
          <p className="text-xs text-slate-400">
            Submit prioritized technical inquiries directly to your course professors.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ask a New Doubt</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          {['All', 'Pending', 'Answered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab} Doubts ({tab === 'All' ? myDoubts.length : myDoubts.filter((d) => d.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Doubts List */}
      {filteredDoubts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">No Doubts Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have any queries under the "{filter}" filter. Click "Ask a New Doubt" above to consult your professors.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => {
            const isAnswered = doubt.status === 'Answered';
            return (
              <div
                key={doubt.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
              >
                {/* Header: Course, Priority, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {doubt.courseCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 truncate max-w-xs sm:max-w-md">
                      {doubt.courseName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Priority Badge */}
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

                    {/* Status Badge */}
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
                          <span>Pending Review</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Question Details */}
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{doubt.topic}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80">
                    {doubt.question}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-[11px] text-slate-500">
                    <span>Directed to: <strong className="text-slate-400">{doubt.professorName}</strong></span>
                    <span>&bull;</span>
                    <span>Submitted: {doubt.createdAt}</span>
                  </div>
                </div>

                {/* Professor's Response Section */}
                {isAnswered && (
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                          {doubt.professorName[0]}
                        </div>
                        <span className="font-bold text-indigo-300">
                          {doubt.professorName}'s Explanation:
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{doubt.answeredAt}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-8">
                      {doubt.answerText}
                    </p>

                    {doubt.referenceUrl && (
                      <div className="pl-8 pt-1">
                        <a
                          href={doubt.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
                        >
                          <span>Reference Link / Paper</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Ask a Doubt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Ask a Course Doubt</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Course & Professor
                </label>
                <select
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {uniqueCourses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} &ndash; {c.name} ({c.professorName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Doubt Topic / Headline
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quorum consensus during network partitions"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Query Explanation
                </label>
                <textarea
                  rows={4}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Describe where you got stuck, relevant lecture slide number, or code segment..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPriority(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        priority === lvl
                          ? lvl === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                            : lvl === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Doubt</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
