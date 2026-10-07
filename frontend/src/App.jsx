import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ToastContainer } from './components/common/Toast';
import { LoginScreen } from './components/auth/LoginScreen';

// Student Views
import { StudentDashboardView } from './components/student/StudentDashboardView';
import { TimetableModule } from './components/student/TimetableModule';
import { AttendanceModule } from './components/student/AttendanceModule';
import { AssignmentsModule } from './components/student/AssignmentsModule';
import { NoticeBoardModule } from './components/student/NoticeBoardModule';
import { LibraryModule } from './components/student/LibraryModule';
import { SupportModule } from './components/student/SupportModule';
import { StudentProfile } from './components/student/StudentProfile';
import { StudentsDirectoryModule } from './components/common/StudentsDirectoryModule';

// Professor Views
import { ProfessorDashboard } from './components/professor/ProfessorDashboard';
import { TimetableEditor } from './components/professor/TimetableEditor';
import { LiveAttendanceManager } from './components/professor/LiveAttendanceManager';
import { DoubtManagement } from './components/professor/DoubtManagement';
import { CourseManager } from './components/professor/CourseManager';
import { ProfessorProfile } from './components/professor/ProfessorProfile';

const MainLayout = () => {
  const { currentUser, userRole, activeTab, switchRole, hod } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    if (userRole === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboardView />;
        case 'profile':
          return <StudentProfile />;
        case 'directory':
          return <StudentsDirectoryModule />;
        case 'attendance':
          return <AttendanceModule />;
        case 'timetable':
          return <TimetableModule />;
        case 'assignments':
          return <AssignmentsModule />;
        case 'notices':
          return <NoticeBoardModule />;
        case 'library':
          return <LibraryModule />;
        case 'support':
          return <SupportModule />;
        default:
          return <StudentDashboardView />;
      }
    } else {
      // Professor Views
      switch (activeTab) {
        case 'dashboard':
          return <ProfessorDashboard />;
        case 'directory':
          return <StudentsDirectoryModule />;
        case 'timetable':
          return <TimetableEditor />;
        case 'attendance':
          return <LiveAttendanceManager />;
        case 'doubts':
          return <DoubtManagement />;
        case 'materials':
          return <CourseManager />;
        case 'profile':
          return <ProfessorProfile />;
        default:
          return <ProfessorDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans flex relative selection:bg-blue-600 selection:text-white">
      {/* Dark Navy Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area (Offset for desktop sidebar) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full transition-all">
        
        {/* Top Header Bar */}
        <TopHeader setMobileOpen={setMobileOpen} />

        {/* Professor Banner Switcher if in Faculty Mode */}
        {userRole === 'professor' && (
          <div className="bg-indigo-900 text-indigo-100 px-4 sm:px-8 py-2.5 text-xs flex items-center justify-between shadow-xs">
            <span>
              Operating in Faculty Mode &bull; {currentUser?.name || hod?.name || 'DR. R. H. JAISWAL'} ({currentUser?.designation || 'HOD Computer Engineering'})
            </span>
            <button
              onClick={() => switchRole('student')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
            >
              Switch back to Student Portal &rarr;
            </button>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6">
          {renderContent()}
        </main>

        {/* Institutional Clean Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-4 sm:px-8 text-xs text-slate-400">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div>
              <span className="font-bold text-slate-700">GEC Palanpur Portal</span>
              <span> &bull; </span>
              <span>Government Engineering College Palanpur</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ERP Live Sync Active</span>
              </span>
              <span>&bull;</span>
              <span>Academic Year 2026 - 2027</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Error caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Application Notice</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'A render issue occurred. Click below to reload cleanly.'}
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.clear();
                  const saved = localStorage.getItem('StudentPortal_db_v3.0');
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    parsed.activeTab = 'dashboard';
                    localStorage.setItem('StudentPortal_db_v3.0', JSON.stringify(parsed));
                  }
                } catch (e) {
                  localStorage.removeItem('StudentPortal_db_v3.0');
                }
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Reset & Reload Cleanly
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
