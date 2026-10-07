import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarDays,
  FileText,
  Bell,
  BookOpen,
  Headphones,
  X,
  LogOut,
  Users,
  QrCode,
  HelpCircle,
  FolderGit2
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, notices, currentUser, userRole, logout } = useApp();

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'directory', label: 'Class Directory', icon: Users },
    { id: 'timetable', label: 'Time Table', icon: CalendarDays },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'notices', label: 'Notice Board', icon: Bell, badge: notices?.filter(n => n.unread)?.length },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  const facultyNavItems = [
    { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Student Directory', icon: Users },
    { id: 'timetable', label: 'Timetable Editor', icon: CalendarDays },
    { id: 'attendance', label: 'Live QR Attendance', icon: QrCode },
    { id: 'doubts', label: 'Doubts Desk', icon: HelpCircle },
    { id: 'materials', label: 'Course Manager', icon: FolderGit2 },
    { id: 'profile', label: 'Faculty Profile', icon: User },
  ];

  const navItems = userRole === 'professor' ? facultyNavItems : studentNavItems;

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0b1a30] text-slate-300 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-wide leading-tight">
                  GEC Palanpur
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  {userRole === 'professor' ? 'Faculty & HOD Hub' : 'Student Academic Portal'}
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#182c4f] text-white shadow-sm border border-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Capsule & Sign Out */}
        <div className="pt-4 border-t border-slate-800/80 px-2 space-y-3">
          {currentUser && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{userRole || 'Student'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (setMobileOpen) setMobileOpen(false);
                  logout();
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              if (setMobileOpen) setMobileOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
