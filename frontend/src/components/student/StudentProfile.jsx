import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  School,
  Download
} from 'lucide-react';

export const StudentProfile = () => {
  const { currentUser, attendanceSummary, addToast, hod } = useApp();

  const student = currentUser || {
    name: "Harshadkumar Bharatbhai Koli",
    enrollment: "CE52",
    rollNo: "CE52",
    department: "Computer Engineering",
    year: "1st Year",
    semester: 1,
    academicYear: "2026 - 2027",
    batch: "CP3",
    program: "First Semester Computer Engineering",
    college: "Government Engineering College Palanpur",
    cgpa: "9.18",
    hodName: "DR. R. H. JAISWAL",
    bloodGroup: "B+"
  };

  const attendance = attendanceSummary[student.enrollment] || { overall: 87.0 };

  const handleDownloadIdCard = () => {
    addToast('Digital Student ID Card downloaded!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Student Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 ring-4 ring-blue-50 shadow-xs shrink-0">
            <User className="w-12 h-12 text-slate-400" />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{student.name}</h2>
                <p className="text-xs text-blue-600 font-mono font-bold tracking-wider">
                  ROLL NO: {student.rollNo || 'CE52'} &bull; ENROLLMENT: {student.enrollment || 'CE52'}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 self-center sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Active Student
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Department of {student.department} &bull; Batch {student.batch}
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-400 mr-1.5">Semester:</span>
                <strong className="text-slate-800">Sem {student.semester} ({student.year})</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-400 mr-1.5">Academic CGPA:</span>
                <strong className="text-emerald-600">{student.cgpa} / 10.0</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-400 mr-1.5">Attendance:</span>
                <strong className="text-blue-600">{attendance.overall}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-medium text-center sm:text-left">Institution: Government Engineering College Palanpur</span>
          <button
            onClick={handleDownloadIdCard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Digital ID Card</span>
          </button>
        </div>
      </div>

      {/* Academic Credentials - Rebalanced layout */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <School className="w-4 h-4 text-blue-600" />
          <span>Academic Affiliations & Department</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Degree Program</span>
            <span className="font-semibold text-slate-800">B.Tech in Computer Engineering</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Academic Year</span>
            <span className="font-semibold text-slate-800">{student.academicYear || "2026 - 2027"}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Head of Department (HOD)</span>
            <span className="font-bold text-blue-600">{hod?.name || student.hodName || "DR. R. H. JAISWAL"}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Blood Group</span>
            <span className="font-semibold text-slate-800">{student.bloodGroup || "B+"}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
