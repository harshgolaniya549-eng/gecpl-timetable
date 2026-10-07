import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderGit2,
  Upload,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Award,
  X,
  Sparkles,
  Users,
  Search,
  BookOpen
} from 'lucide-react';

export const CourseManager = () => {
  const {
    materials,
    assignments,
    uploadMaterial,
    createAssignment,
    gradeSubmission,
    currentUser,
    timetable
  } = useApp();

  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'assignments'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewAsgModalOpen, setIsNewAsgModalOpen] = useState(false);
  const [gradingModalData, setGradingModalData] = useState(null); // { asgId, submission }

  // Upload Material Form States
  const [matTitle, setMatTitle] = useState('');
  const [matSubject, setMatSubject] = useState('Distributed Systems & Cloud Architecture');
  const [matCode, setMatCode] = useState('CS401');
  const [matType, setMatType] = useState('Lecture Slides');
  const [matDesc, setMatDesc] = useState('');
  const [matSize, setMatSize] = useState('3.4 MB');

  // Assignment Creator Form States
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubject, setAsgSubject] = useState('Distributed Systems & Cloud Architecture');
  const [asgCode, setAsgCode] = useState('CS401');
  const [asgDeadline, setAsgDeadline] = useState('2026-10-15T23:59:00');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgMaxMarks, setAsgMaxMarks] = useState(100);

  // Grading states
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const profEmail = currentUser?.email || 'dr.sharma@college.edu';

  // Handle Material Upload
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    uploadMaterial({
      title: matTitle,
      subject: matSubject,
      courseCode: matCode,
      type: matType,
      format: 'PDF',
      size: matSize,
      description: matDesc,
    });

    setMatTitle('');
    setMatDesc('');
    setIsUploadModalOpen(false);
  };

  // Handle New Assignment Submit
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;

    createAssignment({
      title: asgTitle,
      subject: asgSubject,
      courseCode: asgCode,
      deadline: asgDeadline,
      description: asgDesc,
      maxMarks: Number(asgMaxMarks),
    });

    setAsgTitle('');
    setAsgDesc('');
    setIsNewAsgModalOpen(false);
  };

  // Handle Submission Grading
  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!gradingModalData || !gradeInput.trim()) return;

    gradeSubmission(
      gradingModalData.asgId,
      gradingModalData.submission.enrollment,
      gradeInput,
      feedbackInput
    );

    setGradingModalData(null);
    setGradeInput('');
    setFeedbackInput('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Course Assets & Assignment Control</h2>
          </div>
          <p className="text-xs text-slate-400">
            Publish lecture decks, problem sets, and review submitted student coursework.
          </p>
        </div>

        {/* Actions & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'materials'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Course Decks ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'assignments'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Assignments & Grading ({assignments.length})
            </button>
          </div>

          {activeTab === 'materials' ? (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Publish Material</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewAsgModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'materials' ? (
        /* Materials Management Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {mat.type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{mat.size}</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1 leading-snug">{mat.title}</h3>
                <p className="text-xs text-indigo-400 font-mono mb-2">{mat.courseCode} &bull; {mat.subject}</p>
                <p className="text-xs text-slate-400 line-clamp-3 mb-4">{mat.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Published: {mat.uploadedAt}</span>
                <span className="text-emerald-400 font-semibold">{mat.downloads} student downloads</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Assignments & Submissions Inspector */
        <div className="space-y-6">
          {assignments.map((asg) => (
            <div
              key={asg.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                      {asg.courseCode}
                    </span>
                    <h3 className="text-base font-bold text-white">{asg.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">{asg.description}</p>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <span className="text-amber-400 font-mono block">
                    Deadline: {new Date(asg.deadline).toLocaleDateString()}
                  </span>
                  <span className="text-slate-500 font-mono">Max Points: {asg.maxMarks}</span>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Student Submissions ({asg.submissions?.length || 0})</span>
                  </span>
                </div>

                {asg.submissions?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 bg-slate-950/40 rounded-xl text-center">
                    No student submissions uploaded yet for this assignment.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800/80 bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden">
                    {asg.submissions.map((sub) => {
                      const isGraded = sub.status === 'Graded';

                      return (
                        <div
                          key={sub.enrollment}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">{sub.studentName}</span>
                              <span className="font-mono text-indigo-400">({sub.enrollment})</span>
                            </div>
                            <p className="text-slate-400 flex items-center space-x-1.5 mt-0.5">
                              <FileText className="w-3 h-3 text-slate-500" />
                              <span>{sub.fileName}</span>
                              <span>&bull;</span>
                              <span className="text-[11px] text-slate-500">{sub.submittedAt}</span>
                            </p>
                            {isGraded && (
                              <div className="mt-1 flex items-center space-x-2 text-[11px]">
                                <span className="font-bold text-emerald-400">Grade: {sub.grade}</span>
                                {sub.feedback && (
                                  <span className="text-slate-400 italic">&mdash; "{sub.feedback}"</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                setGradingModalData({
                                  asgId: asg.id,
                                  submission: sub,
                                })
                              }
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                                isGraded
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                              }`}
                            >
                              {isGraded ? 'Edit Grade' : 'Grade Solution'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Material Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Publish Course Material</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Material Title
                </label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g. Unit 4: Microservices & Event-Driven Architecture"
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
                    required
                    value={matCode}
                    onChange={(e) => setMatCode(e.target.value)}
                    placeholder="e.g. CS401"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Document Category
                  </label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Lecture Slides">Lecture Slides</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Reference Notes">Reference Notes</option>
                    <option value="Syllabus">Syllabus</option>
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
                  value={matSubject}
                  onChange={(e) => setMatSubject(e.target.value)}
                  placeholder="e.g. Distributed Systems & Cloud Architecture"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Topic Summary
                </label>
                <textarea
                  rows={3}
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  placeholder="Summary of topics covered, lab prerequisites, or reading chapters..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Publish to Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {isNewAsgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Create New Assignment</h3>
              </div>
              <button
                onClick={() => setIsNewAsgModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Lab Exercise 3: Consensus Protocol Implementation"
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
                    required
                    value={asgCode}
                    onChange={(e) => setAsgCode(e.target.value)}
                    placeholder="e.g. CS401"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Max Marks / Points
                  </label>
                  <input
                    type="number"
                    required
                    value={asgMaxMarks}
                    onChange={(e) => setAsgMaxMarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  required
                  value={asgDeadline}
                  onChange={(e) => setAsgDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assignment Instructions / Rubric
                </label>
                <textarea
                  rows={4}
                  required
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  placeholder="Detail test criteria, expected submission format (PDF/DOCX), and grading guidelines..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewAsgModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {gradingModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Grade Student Submission</h3>
              </div>
              <button
                onClick={() => setGradingModalData(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <span className="text-slate-500">Student:</span>
                <p className="text-white font-bold text-sm">
                  {gradingModalData.submission.studentName} ({gradingModalData.submission.enrollment})
                </p>
                <p className="text-slate-400 mt-1 flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-indigo-400" />
                  <span>File: {gradingModalData.submission.fileName}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Score / Grade (e.g. 94/100 or A+)
                </label>
                <input
                  type="text"
                  required
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  placeholder="e.g. 95/100"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Faculty Feedback & Remarks
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Excellent analysis of fault tolerance, well structured code..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setGradingModalData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Confirm Grade</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
