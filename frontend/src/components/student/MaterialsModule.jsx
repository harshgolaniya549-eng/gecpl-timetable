import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderGit2,
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  AlertCircle,
  File,
  Sparkles,
  Paperclip,
  Award
} from 'lucide-react';

export const MaterialsModule = () => {
  const { materials, assignments, submitAssignment, currentUser, addToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('materials'); // 'materials' | 'assignments'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const enrollment = currentUser?.enrollment || '2024CS101';

  // Filter study materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDownload = (mat) => {
    addToast(`Downloading "${mat.title}" (${mat.size})...`, 'info');
    setTimeout(() => {
      addToast(`"${mat.title}" downloaded successfully!`, 'success');
    }, 800);
  };

  const handleFileDrop = (e, asgId) => {
    e.preventDefault();
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadingAssignmentId(asgId);
    }
  };

  const handleConfirmUpload = (asgId) => {
    if (!selectedFile) return;
    submitAssignment(asgId, selectedFile.name);
    setSelectedFile(null);
    setUploadingAssignmentId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Course Materials & Submissions</h2>
          </div>
          <p className="text-xs text-slate-400">
            Access faculty course decks, laboratory manuals, and submit deliverables.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'materials'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Study Materials ({materials.length})
          </button>
          <button
            onClick={() => setActiveSubTab('assignments')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'assignments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Assignments & Tasks ({assignments.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'materials' ? (
        /* Materials Repository Section */
        <div className="space-y-6">
          {/* Search & Type Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, slides, code..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1">
              {['All', 'Lecture Slides', 'Lab Manual', 'Reference Notes', 'Syllabus'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedType === type
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {mat.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{mat.size}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug mb-1">{mat.title}</h3>
                  <p className="text-xs text-indigo-400 font-mono mb-2">{mat.courseCode} &bull; {mat.subject}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{mat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <span>By {mat.professorName}</span>
                  </div>

                  <button
                    onClick={() => handleDownload(mat)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Assignments Section */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((asg) => {
              const submission = asg.submissions.find((s) => s.enrollment === enrollment);
              const isSubmitted = !!submission;
              const isGraded = submission?.status === 'Graded';

              return (
                <div
                  key={asg.id}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {asg.courseCode}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isGraded
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : isSubmitted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Pending Submission'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{asg.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{asg.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                      <span>Max Marks: {asg.maxMarks}</span>
                      <span>&bull;</span>
                      <span className="flex items-center space-x-1 text-amber-400">
                        <Clock className="w-3 h-3" />
                        <span>Due: {new Date(asg.deadline).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Submission Details or Upload Dropzone */}
                  {isSubmitted ? (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <strong className="text-white">{submission.fileName}</strong>
                        </span>
                        <span className="text-[11px] text-slate-500">{submission.submittedAt}</span>
                      </div>

                      {isGraded && (
                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400">Grade: </span>
                            <span className="font-black text-emerald-400 text-sm">{submission.grade}</span>
                            {submission.feedback && (
                              <p className="text-[11px] text-slate-300 italic mt-0.5">
                                "{submission.feedback}"
                              </p>
                            )}
                          </div>
                          <Award className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Dropzone */
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleFileDrop(e, asg.id)}
                      className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-5 text-center transition-all bg-slate-950/40"
                    >
                      <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-200">
                        Drag and drop your solution file (PDF, DOCX)
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Maximum file size: 25MB</p>

                      <div className="mt-3">
                        <input
                          type="file"
                          id={`file-${asg.id}`}
                          className="hidden"
                          accept=".pdf,.docx,.doc,.zip"
                          onChange={(e) => handleFileDrop(e, asg.id)}
                        />
                        <label
                          htmlFor={`file-${asg.id}`}
                          className="inline-block px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 cursor-pointer transition-colors"
                        >
                          Browse Files
                        </label>
                      </div>

                      {uploadingAssignmentId === asg.id && selectedFile && (
                        <div className="mt-3 p-2 bg-slate-900 rounded-xl border border-indigo-500/40 flex items-center justify-between text-xs">
                          <span className="truncate max-w-xs text-white">{selectedFile.name}</span>
                          <button
                            onClick={() => handleConfirmUpload(asg.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                          >
                            Submit Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
