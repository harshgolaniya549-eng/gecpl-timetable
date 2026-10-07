import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Calendar,
  QrCode,
  HelpCircle,
  FolderGit2,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, userRole, logout, switchRole, activeTab, setActiveTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'attendance', label: 'Attendance & QR', icon: QrCode },
    { id: 'doubts', label: 'Doubt Desk', icon: HelpCircle },
    { id: 'materials', label: 'Study & Assignments', icon: FolderGit2 },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const professorNavItems = [
    { id: 'dashboard', label: 'Faculty Hub', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable Editor', icon: Calendar },
    { id: 'attendance', label: 'Live QR Session', icon: QrCode },
    { id: 'doubts', label: 'Doubt Inbox', icon: HelpCircle },
    { id: 'materials', label: 'Course Management', icon: FolderGit2 },
    { id: 'profile', label: 'Faculty Profile', icon: User },
  ];

  const navItems = userRole === 'professor' ? professorNavItems : studentNavItems;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-white">GEC <span className="text-indigo-400">Palanpur</span></span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    CAMPUS
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block -mt-0.5">
                  {userRole === 'professor' ? 'Faculty Portal' : 'Student Portal'}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Utilities: Role Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Quick Role Switcher Pill for instant testability */}
            <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => switchRole('student')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  userRole === 'student'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Student view"
              >
                <span>Student</span>
              </button>
              <button
                onClick={() => switchRole('professor')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  userRole === 'professor'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Professor view"
              >
                <span>Professor</span>
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all focus:outline-none"
              >
                <img
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                />
                <div className="hidden md:block text-left text-xs pr-1">
                  <div className="font-semibold text-slate-200 truncate max-w-[120px]">{currentUser?.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {userRole === 'student' ? currentUser?.enrollment : currentUser?.facultyId || 'Faculty'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300">
                      {userRole === 'professor' ? 'Department Faculty' : `Sem ${currentUser?.semester} CSE`}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>View Profile & Credentials</span>
                    </button>
                    <button
                      onClick={() => {
                        switchRole(userRole === 'student' ? 'professor' : 'student');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/60 rounded-lg transition-colors text-left"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>Switch to {userRole === 'student' ? 'Professor View' : 'Student View'}</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-1">
          <div className="flex items-center justify-between py-2 border-b border-slate-800 mb-2">
            <span className="text-xs text-slate-400 font-medium">Quick Switch:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  switchRole('student');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  userRole === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  switchRole('professor');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  userRole === 'professor' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Professor
              </button>
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
