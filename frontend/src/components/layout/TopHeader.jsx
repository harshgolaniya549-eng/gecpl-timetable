import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  ArrowRightLeft,
  GraduationCap,
  Calendar,
  School,
  Clock,
  QrCode
} from 'lucide-react';
import { ScanAttendanceModal } from '../common/PortalModals';

export const TopHeader = ({ setMobileOpen }) => {
  const {
    currentUser,
    userRole,
    switchRole,
    logout,
    notices,
    markNoticeRead,
    markAllNoticesRead,
    activeQR,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Live real-time clock (Google / Indian Standard Time) updating every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' • ' + now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short'
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notices?.filter((n) => n.unread)?.length || 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
      
      {/* Left: Mobile hamburger & Institutional Branding Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
            <School className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800">GEC Palanpur</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {userRole === 'professor' ? 'Faculty Portal' : 'Student Portal'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Government Engineering College &bull; Computer Engineering Department
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Google/IST Clock & Real-time Status Badges */}
      <div className="flex items-center space-x-2.5">
        {currentTimeStr && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold">{currentTimeStr}</span>
            <span className="text-[10px] text-slate-400 font-sans hidden xl:inline">(IST Real-Time)</span>
          </div>
        )}

        {isWeekend && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <span>🏖️</span>
            <span>Weekend Holiday</span>
          </div>
        )}

        {/* Live Attendance QR Alert Button for Students */}
        {userRole === 'student' && activeQR?.active && (
          <button
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer animate-pulse"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Attendance Active: {activeQR.code || 'Scan Now'}</span>
          </button>
        )}
      </div>

      {/* Right: Notifications & User Profile Capsule */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Holiday Notices Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Holiday Notices & Bulletins"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Holiday Notifications Popover */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-92 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-800">Holiday Notices</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNoticesRead}
                    className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNoticeRead(n.id);
                      setActiveTab('notices');
                      setNotifOpen(false);
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                      n.unread ? 'bg-amber-50/60 hover:bg-amber-50 border border-amber-100/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                        {n.date}
                      </span>
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                      {n.category || 'Holiday'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setActiveTab('notices');
                    setNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View All Holiday Circulars &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Capsule with Generic User Icon (No existing photo) */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-slate-100 transition-colors group cursor-pointer"
          >
            {/* Generic User Avatar Icon */}
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:border-blue-300 transition-colors shadow-xs">
              <User className="w-4 h-4 text-slate-600" />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.name || "Student"}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {userRole === 'professor' 
                  ? (currentUser?.designation || 'Faculty') 
                  : `${currentUser?.batch || 'CP3'} • Sem ${currentUser?.semester || 1}`}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
              <div className="p-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
                  </div>
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                  {userRole === 'professor'
                    ? `Faculty ID: ${currentUser?.facultyId || 'HOD_RHJ'}`
                    : `Roll No: ${currentUser?.rollNo || 'CE52'} • Batch ${currentUser?.batch || 'CP3'}`}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My {userRole === 'professor' ? 'Faculty' : 'Student'} Profile</span>
                </button>

                <button
                  onClick={() => {
                    switchRole(userRole === 'student' ? 'professor' : 'student');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Switch to {userRole === 'student' ? 'Professor View' : 'Student View'}</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Direct Sign Out Button */}
        <button
          onClick={() => logout()}
          title="Sign Out"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>

      </div>

      {/* Live QR Modal */}
      <ScanAttendanceModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

    </header>
  );
};
