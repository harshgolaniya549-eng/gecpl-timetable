import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart2,
  Award,
  Download,
  CheckCircle2,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const ResultsModule = () => {
  const { results, currentUser, addToast } = useApp();
  const [selectedSem, setSelectedSem] = useState(0);

  const semData = results?.semesters?.[selectedSem] || results?.semesters?.[0];

  const handleDownloadMarksheet = (semName) => {
    addToast(`Official marksheet for ${semName} downloaded!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Academic Results & Performance</h2>
            <p className="text-xs text-slate-500">Official semester grade sheets and continuous assessment scores</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">CUMULATIVE CGPA</span>
            <span className="text-lg font-bold text-slate-900">{results.cgpa}</span>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[10px]">CURRENT SGPA</span>
            <span className="text-lg font-bold text-emerald-600">{results.sgpa}</span>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[10px]">CLASS RANK</span>
            <span className="text-xs font-bold text-blue-600">{results.rank}</span>
          </div>
        </div>
      </div>

      {/* Semester Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {results?.semesters?.map((sem, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedSem(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSem === idx
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {sem.sem}
          </button>
        ))}
      </div>

      {/* Marks Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{semData.sem} ({semData.year})</h3>
            <p className="text-xs text-slate-500">
              Status: <span className="font-semibold text-emerald-600">{semData.status}</span> &bull; SGPA: <strong>{semData.sgpa}</strong>
            </p>
          </div>

          <button
            onClick={() => handleDownloadMarksheet(semData.sem)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download PDF Marksheet</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="pb-3">Course Code</th>
                <th className="pb-3">Course Title</th>
                <th className="pb-3 text-center">Marks / Internal</th>
                <th className="pb-3 text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {semData.subjects.map((sub, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-mono font-bold text-blue-600 text-xs">{sub.code}</td>
                  <td className="py-3 font-semibold text-slate-800">{sub.name}</td>
                  <td className="py-3 text-center font-medium text-slate-600">
                    {sub.internal ? `${sub.internal} / ${sub.total}` : `${sub.marks} / 100`}
                  </td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {sub.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
