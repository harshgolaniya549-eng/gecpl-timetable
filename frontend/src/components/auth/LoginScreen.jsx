import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  GraduationCap,
  UserCheck,
  Database,
  KeyRound,
  Hash,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  School,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const LoginScreen = () => {
  const { login } = useApp();
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'professor'
  const [identifier, setIdentifier] = useState('CE14');
  const [password, setPassword] = useState('2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'checking' | 'offline'

  // Live real-time clock (Google / Indian Standard Time)
  const [currentTimeStr, setCurrentTimeStr] = useState('');

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
          month: 'short',
          year: 'numeric'
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check live MongoDB backend connection on mount
  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      try {
        const res = await api.checkHealth();
        if (isMounted) {
          if (res && res.status === 'online') {
            setDbStatus('connected');
          } else {
            setDbStatus('offline');
          }
        }
      } catch {
        if (isMounted) setDbStatus('offline');
      }
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Form submission with custom credentials
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!identifier.trim()) {
      setAuthError(
        activeTab === 'student'
          ? 'Please enter your Roll Number (e.g. CE14, CE52) or Name (e.g. Harsh Tiwari)'
          : 'Please enter your Faculty User ID or Name (e.g. HOD_RHJ, Jaiswal)'
      );
      return;
    }
    const cleanPwd = password && password.trim() ? password.trim() : '2026';

    setLoading(true);
    try {
      const result = await login(activeTab, identifier, cleanPwd);
      if (!result?.success) {
        setAuthError(result?.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setAuthError(err.message || 'Server connection failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (role, demoId) => {
    setActiveTab(role);
    setIdentifier(demoId);
    setPassword('2026');
    setAuthError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Institutional Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
              GEC Palanpur
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Government Engineering College &bull; Computer Engineering Department
            </p>
          </div>
        </div>

        {/* Real-time Clock & Database Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5">
          {currentTimeStr && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{currentTimeStr}</span>
            </div>
          )}

          {dbStatus === 'connected' ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>MongoDB Connected</span>
            </div>
          ) : dbStatus === 'checking' ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span>Connecting...</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Local Offline Mode</span>
            </div>
          )}
        </div>
      </header>

      {/* Center Main Hero: Only Sign In with Credentials Form */}
      <main className="w-full max-w-xl mx-auto my-auto py-8 sm:py-12 relative z-10 flex flex-col items-center">
        
        {/* Title Header */}
        <div className="text-center max-w-md mx-auto mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-3">
            <School className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic Portal Authentication</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Sign In with Credentials
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Government Engineering College Palanpur &bull; Single Sign-On
          </p>
        </div>

        {/* Credentials Form Box */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setIdentifier('CE14');
                setAuthError('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('professor');
                setIdentifier('HOD_RHJ');
                setAuthError('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'professor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Faculty & HOD Portal</span>
            </button>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium leading-relaxed">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {activeTab === 'student'
                  ? 'Student Roll Number or Full Name'
                  : 'Faculty User ID, Username or Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {activeTab === 'student' ? (
                    <Hash className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Mail className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder={
                    activeTab === 'student'
                      ? 'e.g. CE14, Harsh Tiwari, CE52'
                      : 'e.g. HOD_RHJ, Jaiswal, PROF_KMG'
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {activeTab === 'student'
                  ? 'Enter your Roll Number (CE14, CE52) or Student Name.'
                  : 'Enter Faculty ID (HOD_RHJ, PROF_KMG) or Professor Name.'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <span className="text-[11px] text-indigo-400 font-mono font-medium">Default: 2026</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] cursor-pointer mt-2 ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-indigo-600/30 hover:shadow-indigo-600/50'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-indigo-400 shadow-purple-600/30 hover:shadow-purple-600/50'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to {activeTab === 'student' ? 'Student' : 'Faculty'} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Pills */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 block mb-2">Quick Select Account:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('student', 'CE14')}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/40 transition-colors font-semibold cursor-pointer"
              >
                Student CE14 (Harsh Tiwari) ★
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('student', 'CE52')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-indigo-600/20 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              >
                Student CE52 (Harshadkumar)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('student', 'CE01')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-indigo-600/20 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              >
                Student CE01 (Kamalkumar)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('professor', 'HOD_RHJ')}
                className="px-2.5 py-1 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/40 transition-colors font-semibold cursor-pointer"
              >
                Professor (DR. R. H. JAISWAL - HOD)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('professor', 'PROF_KMG')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-purple-600/20 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              >
                Professor (PROF. K. M. GOHEL)
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Institutional Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 relative z-10">
        <div>
          <span>Government Engineering College, Palanpur</span>
          <span> &bull; </span>
          <span>Ahmedabad-Palanpur Highway, Palanpur, Gujarat 385001</span>
        </div>
        <div>
          <span>Academic Year 2026 - 2027</span>
          <span> &bull; </span>
          <span>GEC Palanpur Campus Portal</span>
        </div>
      </footer>

    </div>
  );
};
