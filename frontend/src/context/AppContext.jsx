import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_STUDENTS,
  INITIAL_PROFESSORS,
  INITIAL_TIMETABLE,
  INITIAL_ATTENDANCE_SUMMARY,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_DOUBTS,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_NOTICES,
  INITIAL_RECENT_ACTIVITY,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_SUPPORT_FAQS,
  INITIAL_ACTIVE_QR
} from '../data/mockData';
import { api, formatTimetableForUI } from '../services/api';

const AppContext = createContext(null);

const STORAGE_KEY = 'StudentPortal_db_v3.0';

const DEFAULT_BG_SETTINGS = {
  overlayOpacity: 0.60,
  blur: 0,
  tint: true,
};

export const AppProvider = ({ children }) => {
  // Load state from localStorage or initialize with seed data
  const loadInitialState = () => {
    try {
      const isLoggedOut = sessionStorage.getItem('user_logged_out') === 'true';
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !isLoggedOut) {
        const parsed = JSON.parse(saved);
        if (parsed.currentUser && (parsed.currentUser.name === 'Mili Patel' || parsed.currentUser.rollNo === 'CE2401')) {
          parsed.currentUser = null;
          parsed.userRole = null;
        }
        if (!parsed.libraryBooks || parsed.libraryBooks.length < 10) {
          parsed.libraryBooks = INITIAL_LIBRARY_BOOKS;
        }
        if (!parsed.notices || parsed.notices.some(n => n.category !== 'Holiday')) {
          parsed.notices = INITIAL_NOTICES;
        }
        if (parsed.activeTab === 'results') {
          parsed.activeTab = 'dashboard';
        }
        if (!parsed.timetable || parsed.timetable.length < 10) {
          parsed.timetable = INITIAL_TIMETABLE;
        }
        return {
          ...parsed,
          timetable: (parsed.timetable && parsed.timetable.length >= 10) ? parsed.timetable : INITIAL_TIMETABLE,
          activeTab: parsed.activeTab === 'results' ? 'dashboard' : (parsed.activeTab || 'dashboard'),
          libraryBooks: parsed.libraryBooks || INITIAL_LIBRARY_BOOKS,
          notices: parsed.notices || INITIAL_NOTICES,
          bgSettings: DEFAULT_BG_SETTINGS,
        };
      }
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
    return {
      currentUser: null,
      userRole: null,
      activeTab: 'dashboard',
      timetable: INITIAL_TIMETABLE,
      attendanceSummary: INITIAL_ATTENDANCE_SUMMARY,
      attendanceLogs: INITIAL_ATTENDANCE_LOGS,
      doubts: INITIAL_DOUBTS,
      materials: INITIAL_MATERIALS,
      assignments: INITIAL_ASSIGNMENTS,
      notices: INITIAL_NOTICES,
      recentActivity: INITIAL_RECENT_ACTIVITY,
      libraryBooks: INITIAL_LIBRARY_BOOKS,
      supportFaqs: INITIAL_SUPPORT_FAQS,
      activeQR: INITIAL_ACTIVE_QR,
      bgSettings: DEFAULT_BG_SETTINGS,
    };
  };

  const [state, setState] = useState(loadInitialState);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTabState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeTab && parsed.activeTab !== 'results') {
          return parsed.activeTab;
        }
      }
    } catch {}
    return 'dashboard';
  });

  const setActiveTab = (tab) => {
    const cleanTab = tab === 'results' ? 'dashboard' : tab;
    setActiveTabState(cleanTab);
    setState(prev => ({ ...prev, activeTab: cleanTab }));
  };

  // Sync state changes to localStorage and dispatch custom event for cross-component and cross-tab sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('GEC Palanpur_state_updated'));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
  }, [state]);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === 'GEC_ACTIVE_QR' && e.newValue) {
        try {
          const qr = JSON.parse(e.newValue);
          setState((prev) => ({ ...prev, activeQR: qr }));
        } catch (err) {}
      }
    };

    const handleQRBroadcast = (e) => {
      if (e.detail) {
        setState((prev) => ({ ...prev, activeQR: e.detail }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('GEC_QR_BROADCAST', handleQRBroadcast);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('GEC_QR_BROADCAST', handleQRBroadcast);
    };
  }, []);

  // Toast System
  const addToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load batch timetable from MongoDB
  const loadBatchTimetable = async (batch) => {
    const targetBatch = batch || state.currentUser?.batch || 'CP1';
    try {
      // First try to fetch all batches together so all batches are fully synchronized
      const allData = await api.getAllTimetables();
      if (allData && Array.isArray(allData) && allData.length > 0) {
        const allFormatted = [];
        allData.forEach((d) => {
          if (d.timetable && d.batch) {
            allFormatted.push(...formatTimetableForUI(d.timetable, d.batch));
          }
        });
        if (allFormatted.length > 0) {
          setState((prev) => ({
            ...prev,
            timetable: allFormatted
          }));
          return allFormatted;
        }
      }

      // Fallback to single batch endpoint
      const data = await api.getTimetable(targetBatch);
      if (data && data.timetable) {
        const formatted = formatTimetableForUI(data.timetable, targetBatch);
        if (formatted.length > 0) {
          setState((prev) => ({
            ...prev,
            timetable: formatted
          }));
          return formatted;
        }
      }
    } catch (e) {
      console.warn(`Could not load timetable for ${targetBatch}`, e);
    }
  };

  // Automatically fetch live timetable from MongoDB on mount
  useEffect(() => {
    loadBatchTimetable(state.currentUser?.batch || 'CP1');
  }, []);

  // Authentication Handlers connecting to MongoDB Server
  const login = async (role, identifier, password = '2026') => {
    try {
      sessionStorage.removeItem('user_logged_out');
      sessionStorage.setItem('portal_session_active', 'true');
    } catch (e) {
      console.error(e);
    }

    if (!identifier || !identifier.trim()) {
      const msg = 'Please enter your Roll Number, Name, or User ID';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
    const cleanPwd = password && password.trim() ? password.trim() : '2026';

    if (role === 'student') {
      try {
        const response = await api.studentLogin(identifier, cleanPwd);
        if (response.success && response.data) {
          const dbStudent = response.data;
          const student = {
            id: dbStudent._id,
            sr_no: dbStudent.sr_no,
            name: dbStudent.student_name,
            rollNo: dbStudent.roll_number,
            enrollment: dbStudent.user_id || dbStudent.roll_number,
            batch: dbStudent.batch,
            college: dbStudent.college || 'Government Engineering College Palanpur',
            program: dbStudent.program || 'First Semester Computer Engineering',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            year: '1st Year',
            semester: dbStudent.semester || 1,
            academicYear: '2026 - 2027',
            email: dbStudent.email || `${dbStudent.roll_number.toLowerCase()}@gecp.ac.in`,
            phone: dbStudent.phone || '+91 98765 43210',
            avatar: dbStudent.avatar || null,
            advisor: 'DR. R. H. JAISWAL',
            hodName: 'DR. R. H. JAISWAL'
          };

          // Fetch real timetable from MongoDB for this student's batch
          let batchTimetable = [];
          try {
            const ttDoc = await api.getTimetable(dbStudent.batch);
            if (ttDoc && ttDoc.timetable) {
              batchTimetable = formatTimetableForUI(ttDoc.timetable, dbStudent.batch);
            }
          } catch (ttErr) {
            console.warn('Could not fetch batch timetable from backend', ttErr);
          }

          setState((prev) => ({
            ...prev,
            currentUser: student,
            userRole: 'student',
            timetable: batchTimetable.length > 0 ? batchTimetable : (prev.timetable?.length > 0 ? prev.timetable : INITIAL_TIMETABLE)
          }));

          setActiveTab('dashboard');
          addToast(`Welcome back, ${student.name}! (${student.batch})`, 'success');
          return { success: true, user: student };
        }
      } catch (err) {
        // Fallback for network error / offline backend so user is never locked out
        const isNetworkErr = !err.message || 
          /fetch|network|failed|offline|500|server is not running|connect/i.test(err.message);

        if (isNetworkErr) {
          const rawId = identifier.trim();
          const cleanId = rawId.toUpperCase();
          const isHarsh = /harsh|tiwari|14/i.test(rawId);
          const numId = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;
          const found = (isHarsh ? INITIAL_STUDENTS.find((s) => s.rollNo === 'CE14') : null) ||
            INITIAL_STUDENTS.find(
              (s) =>
                s.rollNo?.toUpperCase() === cleanId ||
                s.user_id?.toUpperCase() === cleanId ||
                s.email?.toUpperCase() === cleanId ||
                s.name?.toLowerCase().includes(rawId.toLowerCase()) ||
                (numId !== null && (s.sr_no === numId || s.rollNo?.endsWith(`${numId}`)))
            ) || {
            id: `stud_${cleanId.toLowerCase()}`,
            name: isHarsh ? 'Harsh Rajkishor Tiwari' : (cleanId === 'CE52' ? 'Harshadkumar Bharatbhai Koli' : `Student (${cleanId})`),
            student_name: isHarsh ? 'Harsh Rajkishor Tiwari' : (cleanId === 'CE52' ? 'Harshadkumar Bharatbhai Koli' : `Student (${cleanId})`),
            rollNo: isHarsh ? 'CE14' : cleanId,
            user_id: isHarsh ? 'CE14' : cleanId,
            enrollment: isHarsh ? 'CE14' : cleanId,
            batch: isHarsh ? 'CP1' : (cleanId === 'CE52' ? 'CP3' : (cleanId === 'CE26' ? 'CP2' : 'CP1')),
            college: 'Government Engineering College Palanpur',
            program: 'First Semester Computer Engineering',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            year: '1st Year',
            semester: 1,
            academicYear: '2026 - 2027',
            email: `${cleanId.toLowerCase()}@gecp.ac.in`,
            phone: '+91 98765 43210',
            avatar: null,
            advisor: 'DR. R. H. JAISWAL',
            hodName: 'DR. R. H. JAISWAL'
          };

          setState((prev) => ({
            ...prev,
            currentUser: found,
            userRole: 'student',
            timetable: prev.timetable?.length > 0 ? prev.timetable : INITIAL_TIMETABLE
          }));
          setActiveTab('dashboard');
          addToast(`Welcome back, ${found.name}! (Offline Mode)`, 'info');
          return { success: true, user: found };
        }

        addToast(err.message || 'Login failed', 'error');
        return { success: false, message: err.message };
      }
    } else {
      // Professor Login
      try {
        const response = await api.facultyLogin(identifier, cleanPwd);
        if (response.success && response.data) {
          const dbProf = response.data;
          const prof = {
            id: dbProf._id,
            name: dbProf.name,
            designation: dbProf.designation || 'ASSOCIATE PROFESSOR',
            role: dbProf.role || 'HOD',
            facultyId: dbProf.user_id,
            username: dbProf.username,
            email: dbProf.email || 'dr.rh.jaiswal@gecp.ac.in',
            college: dbProf.college || 'Government Engineering College, Palanpur',
            department: dbProf.department || 'Computer Engineering Department',
            departmentCode: 'CE',
            qualification: dbProf.qualification || 'PH.D.',
            experience: dbProf.experience || '26 YEARS',
            specialization: Array.isArray(dbProf.area_of_interest) ? dbProf.area_of_interest.join(', ') : (dbProf.area_of_interest || 'Information Security, Cyber Security'),
            office: 'Academic Block A, Cabin 204',
            cabinHours: 'Mon - Fri, 02:00 PM - 04:00 PM',
            phone: dbProf.phone || '+91 98220 11223',
            avatar: dbProf.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
          };

          // Fetch real timetable from MongoDB so faculty dashboard has lecture slots
          let batchTimetable = [];
          try {
            const ttDoc = await api.getTimetable('CP1');
            if (ttDoc && ttDoc.timetable) {
              batchTimetable = formatTimetableForUI(ttDoc.timetable, 'CP1');
            }
          } catch (ttErr) {
            console.warn('Could not load faculty timetable', ttErr);
          }

          setState((prev) => ({
            ...prev,
            currentUser: prof,
            userRole: 'professor',
            timetable: batchTimetable.length > 0 ? batchTimetable : (prev.timetable?.length > 0 ? prev.timetable : INITIAL_TIMETABLE)
          }));

          setActiveTab('dashboard');
          addToast(`Welcome back, ${prof.name}!`, 'success');
          return { success: true, user: prof };
        }
      } catch (err) {
        // Fallback for network error / offline backend so user is never locked out
        const isNetworkErr = !err.message || 
          /fetch|network|failed|offline|500|server is not running|connect/i.test(err.message);

        if (isNetworkErr) {
          const rawId = identifier.trim();
          const cleanId = rawId.toUpperCase();
          const isJaiswal = /jaiswal|rhj|hod/i.test(rawId);
          const isGohel = /gohel|kmg/i.test(rawId);
          const foundProf = INITIAL_PROFESSORS.find(
            (p) =>
              (isJaiswal && (p.facultyId === 'HOD_RHJ' || p.role === 'HOD')) ||
              (isGohel && p.facultyId === 'PROF_KMG') ||
              p.facultyId?.toUpperCase() === cleanId ||
              p.user_id?.toUpperCase() === cleanId ||
              p.username?.toUpperCase() === cleanId ||
              p.email?.toUpperCase() === cleanId ||
              p.name?.toLowerCase().includes(rawId.toLowerCase())
          ) || {
            id: `prof_${cleanId.toLowerCase()}`,
            name: isGohel ? 'PROF. K. M. GOHEL' : 'DR. R. H. JAISWAL',
            role: isGohel ? 'Faculty' : 'HOD',
            facultyId: isGohel ? 'PROF_KMG' : 'HOD_RHJ',
            user_id: isGohel ? 'PROF_KMG' : 'HOD_RHJ',
            designation: isGohel ? 'ASSISTANT PROFESSOR' : 'ASSOCIATE PROFESSOR',
            college: 'Government Engineering College, Palanpur',
            department: 'Computer Engineering Department',
            departmentCode: 'CE',
            email: isGohel ? 'prof.km.gohel@gecp.ac.in' : 'dr.rh.jaiswal@gecp.ac.in',
            phone: '+91 98220 11223',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          };

          setState((prev) => ({
            ...prev,
            currentUser: foundProf,
            userRole: 'professor',
            timetable: prev.timetable?.length > 0 ? prev.timetable : INITIAL_TIMETABLE
          }));
          setActiveTab('dashboard');
          addToast(`Welcome back, ${foundProf.name}! (Offline Mode)`, 'info');
          return { success: true, user: foundProf };
        }

        addToast(err.message || 'Faculty login failed', 'error');
        return { success: false, message: err.message };
      }
    }
  };

  const hod = {
    name: 'DR. R. H. JAISWAL',
    designation: 'ASSOCIATE PROFESSOR',
    role: 'HOD',
    department: 'Computer Engineering Department',
    college: 'Government Engineering College, Palanpur',
    qualification: 'PH.D.',
    experience: '26 YEARS',
    email: 'dr.rh.jaiswal@gecp.ac.in',
    phone: '+91 98220 11223',
    office: 'Academic Block A, Cabin 204',
    cabinHours: 'Mon - Fri, 02:00 PM - 04:00 PM'
  };

  const logout = () => {
    try {
      sessionStorage.setItem('user_logged_out', 'true');
      sessionStorage.removeItem('portal_session_active');
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.error(e);
    }
    setState((prev) => ({
      ...prev,
      currentUser: null,
      userRole: null,
    }));
    setActiveTab('dashboard');
    addToast('Logged out. Please select your profile to continue.', 'info');
  };

  // Quick switch between real MongoDB demo roles
  const switchRole = async (role) => {
    if (role === 'student') {
      await login('student', 'CE52', '2026');
    } else {
      await login('professor', 'HOD_RHJ', '2026');
    }
  };

  // Timetable Operations
  const addSlot = (newSlot) => {
    const slotObj = {
      id: newSlot.id || `slot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      batch: newSlot.batch || 'CP1',
      day: newSlot.day || 'Monday',
      time: newSlot.time || `${newSlot.startTime || '10:30 AM'} to ${newSlot.endTime || '11:30 AM'}`,
      timeStr: newSlot.time || `${newSlot.startTime || '10:30 AM'} to ${newSlot.endTime || '11:30 AM'}`,
      startTime: newSlot.startTime || '10:30 AM',
      endTime: newSlot.endTime || '11:30 AM',
      subject: newSlot.subject || 'Class Lecture',
      code: newSlot.code || (newSlot.subject ? newSlot.subject.split(' ')[0] : 'CE'),
      faculty: newSlot.faculty || state.currentUser?.name || 'Department Faculty',
      facultyName: newSlot.faculty || state.currentUser?.name || 'Department Faculty',
      professorName: newSlot.faculty || state.currentUser?.name || 'Department Faculty',
      room: newSlot.room || 'Room 8109',
      type: newSlot.type || 'Lecture',
      status: newSlot.status || 'Scheduled',
      notes: newSlot.notes || '',
      attendanceMarked: false
    };

    setState((prev) => ({
      ...prev,
      timetable: [...prev.timetable, slotObj]
    }));
    addToast(`New lecture slot "${slotObj.subject}" added to timetable.`, 'success');
    return slotObj;
  };

  const updateSlot = (slotId, updates) => {
    setState((prev) => ({
      ...prev,
      timetable: prev.timetable.map((slot) =>
        slot.id === slotId ? { ...slot, ...updates } : slot
      ),
    }));
    addToast('Lecture slot updated in real time.', 'success');
  };

  const deleteSlot = (slotId) => {
    setState((prev) => ({
      ...prev,
      timetable: prev.timetable.filter((s) => s.id !== slotId)
    }));
    addToast('Lecture slot removed from timetable.', 'info');
  };

  const cancelSlot = (slotId, reason = 'Cancelled by Professor') => {
    setState((prev) => ({
      ...prev,
      timetable: prev.timetable.map((slot) =>
        slot.id === slotId
          ? { ...slot, status: 'Cancelled', notes: `Notice: ${reason}` }
          : slot
      ),
    }));
    addToast('Lecture marked as cancelled. Students notified.', 'warning');
  };

  const saveTimetableChanges = async (batch = 'CP1') => {
    try {
      const batchSlots = state.timetable.filter((s) => !s.batch || s.batch === batch);
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const rawMap = {};
      days.forEach((d) => {
        rawMap[d] = batchSlots
          .filter((s) => s.day === d)
          .map((s) => [s.time || `${s.startTime} to ${s.endTime}`, s.subject, s.faculty || s.facultyName || 'Faculty', s.room]);
      });

      await api.saveTimetable(batch, rawMap);
      addToast(`Timetable for Batch ${batch} saved to database in real time!`, 'success');
      return true;
    } catch (e) {
      console.warn('Could not save timetable to backend', e);
      addToast('Timetable updated in local session.', 'info');
      return false;
    }
  };

  // Live QR Attendance Operations
  const generateQR = (slotId, durationSec = 180) => {
    const slot = state.timetable.find((s) => s.id === slotId) || state.timetable[0];
    if (!slot) return;

    const token = `GEC Palanpur-AUTH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).toUpperCase()}`;

    const newQR = {
      slotId: slot.id,
      subject: slot.subject,
      code: slot.code,
      room: slot.room,
      professorEmail: state.currentUser?.email || slot.professorEmail || 'hod.ce@gecp.ac.in',
      professorName: state.currentUser?.name || slot.professorName || 'DR. R. H. JAISWAL',
      token,
      generatedAt: Date.now(),
      expiresInSeconds: durationSec,
      active: true,
    };

    // Also mark the lecture slot status as 'Live Now'
    setState((prev) => ({
      ...prev,
      activeQR: newQR,
      timetable: prev.timetable.map((s) =>
        s.id === slot.id ? { ...s, status: 'Live Now' } : s
      ),
    }));

    try {
      localStorage.setItem('GEC_ACTIVE_QR', JSON.stringify(newQR));
      window.dispatchEvent(new CustomEvent('GEC_QR_BROADCAST', { detail: newQR }));
    } catch (e) {}

    addToast(`Live QR Code broadcasted for ${slot.subject}! Students can now mark attendance online.`, 'success');
    return newQR;
  };

  const closeQR = () => {
    setState((prev) => ({
      ...prev,
      activeQR: prev.activeQR ? { ...prev.activeQR, active: false } : null,
    }));
    addToast('Live QR attendance session concluded.', 'info');
  };

  // Mark Attendance via QR (Student side)
  const submitAttendanceQR = (tokenInput) => {
    if (!state.currentUser || state.userRole !== 'student') {
      addToast('Only authenticated students can submit attendance.', 'error');
      return { success: false, message: 'Invalid role' };
    }

    const qr = state.activeQR;
    if (!qr || !qr.active) {
      addToast('No active attendance QR session is currently open.', 'error');
      return { success: false, message: 'No active lecture session' };
    }

    // Check expiration
    const elapsed = (Date.now() - qr.generatedAt) / 1000;
    if (elapsed > qr.expiresInSeconds) {
      addToast('This QR Code has expired! Please ask your professor to regenerate.', 'error');
      return { success: false, message: 'QR Code Expired' };
    }

    // Check token match
    const cleanInput = tokenInput.trim().toUpperCase();
    if (cleanInput !== qr.token.toUpperCase()) {
      addToast('Invalid QR security token. Please rescan.', 'error');
      return { success: false, message: 'Token Mismatch' };
    }

    // Check if student already marked
    const alreadyMarked = state.attendanceLogs.some(
      (log) => log.lectureId === qr.slotId && log.enrollment === state.currentUser.enrollment
    );

    if (alreadyMarked) {
      addToast('Attendance already marked for this lecture today!', 'info');
      return { success: true, message: 'Already marked' };
    }

    // Record attendance log
    const newLog = {
      id: `att_${Date.now()}`,
      lectureId: qr.slotId,
      subject: qr.subject,
      studentId: state.currentUser.id,
      enrollment: state.currentUser.enrollment,
      studentName: state.currentUser.name,
      timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'Present',
      method: 'Live QR Scan',
    };

    // Update attendance summary for this student
    const studentEnrollment = state.currentUser.enrollment;
    const currentSummary = state.attendanceSummary[studentEnrollment] || {
      overall: 80,
      attendedTotal: 20,
      totalConducted: 25,
      subjects: [],
    };

    const updatedSubjects = [...(currentSummary.subjects || [])];
    const subIdx = updatedSubjects.findIndex((s) => s.code === qr.code);
    if (subIdx >= 0) {
      const curSub = updatedSubjects[subIdx];
      const newAttended = curSub.attended + 1;
      const newTotal = curSub.total + 1;
      updatedSubjects[subIdx] = {
        ...curSub,
        attended: newAttended,
        total: newTotal,
        percentage: Number(((newAttended / newTotal) * 100).toFixed(1)),
      };
    } else {
      updatedSubjects.push({
        code: qr.code,
        name: qr.subject,
        attended: 1,
        total: 1,
        percentage: 100,
      });
    }

    const newAttendedTotal = currentSummary.attendedTotal + 1;
    const newConductedTotal = currentSummary.totalConducted + 1;
    const newOverall = Number(((newAttendedTotal / newConductedTotal) * 100).toFixed(1));

    setState((prev) => ({
      ...prev,
      attendanceLogs: [newLog, ...prev.attendanceLogs],
      attendanceSummary: {
        ...prev.attendanceSummary,
        [studentEnrollment]: {
          ...currentSummary,
          attendedTotal: newAttendedTotal,
          totalConducted: newConductedTotal,
          overall: newOverall,
          subjects: updatedSubjects,
        },
      },
    }));

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch (e) {
      // Confetti fallback
    }

    addToast(`Attendance Verified! You are marked Present for ${qr.subject}.`, 'success');
    return { success: true, message: 'Attendance marked successfully' };
  };

  // Doubts Resolution
  const askDoubt = ({ courseCode, courseName, topic, question, priority = 'Medium', professorEmail, professorName }) => {
    const newDoubt = {
      id: `dbt_${Date.now()}`,
      studentId: state.currentUser?.id || 'stud_demo',
      studentName: state.currentUser?.name || 'Aarav Sharma',
      enrollment: state.currentUser?.enrollment || '2024CS101',
      courseCode,
      courseName,
      professorEmail,
      professorName,
      topic,
      question,
      priority,
      status: 'Pending',
      createdAt: 'Just now',
      answeredAt: null,
      answerText: '',
      referenceUrl: '',
    };

    setState((prev) => ({
      ...prev,
      doubts: [newDoubt, ...prev.doubts],
    }));

    addToast('Doubt submitted to professor. You will receive a notification when answered.', 'success');
  };

  const replyDoubt = (doubtId, answerText, referenceUrl = '') => {
    setState((prev) => ({
      ...prev,
      doubts: prev.doubts.map((d) =>
        d.id === doubtId
          ? {
            ...d,
            status: 'Answered',
            answerText,
            referenceUrl,
            answeredAt: 'Just now',
          }
          : d
      ),
    }));

    addToast('Doubt response dispatched to student.', 'success');
  };

  // Materials & Assignments
  const uploadMaterial = (materialData) => {
    const newMaterial = {
      id: `mat_${Date.now()}`,
      professorEmail: state.currentUser?.email || 'dr.sharma@college.edu',
      professorName: state.currentUser?.name || 'Dr. Rajesh Sharma',
      uploadedAt: 'Today',
      downloads: 0,
      ...materialData,
    };

    setState((prev) => ({
      ...prev,
      materials: [newMaterial, ...prev.materials],
    }));

    addToast(`"${materialData.title}" published successfully to student repositories.`, 'success');
  };

  const createAssignment = (assignmentData) => {
    const newAssignment = {
      id: `asg_${Date.now()}`,
      professorEmail: state.currentUser?.email || 'dr.sharma@college.edu',
      professorName: state.currentUser?.name || 'Dr. Rajesh Sharma',
      submissions: [],
      ...assignmentData,
    };

    setState((prev) => ({
      ...prev,
      assignments: [newAssignment, ...prev.assignments],
    }));

    addToast(`Assignment "${assignmentData.title}" posted with deadline.`, 'success');
  };

  const submitAssignment = (assignmentId, fileName) => {
    if (!state.currentUser) return;

    const submission = {
      studentId: state.currentUser.id,
      enrollment: state.currentUser.enrollment,
      studentName: state.currentUser.name,
      submittedAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      fileName: fileName || `${state.currentUser.name}_Submission.pdf`,
      status: 'Submitted',
      grade: null,
      feedback: null,
    };

    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((asg) => {
        if (asg.id === assignmentId) {
          const filtered = asg.submissions.filter(
            (s) => s.enrollment !== state.currentUser.enrollment
          );
          return {
            ...asg,
            submissions: [...filtered, submission],
          };
        }
        return asg;
      }),
    }));

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (e) { }

    addToast(`Assignment submission uploaded successfully!`, 'success');
  };

  const gradeSubmission = (assignmentId, enrollment, grade, feedback) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((asg) => {
        if (asg.id === assignmentId) {
          return {
            ...asg,
            submissions: asg.submissions.map((sub) =>
              sub.enrollment === enrollment
                ? { ...sub, status: 'Graded', grade, feedback }
                : sub
            ),
          };
        }
        return asg;
      }),
    }));

    addToast(`Graded submission for student ${enrollment}: ${grade}`, 'success');
  };

  const updateBgSettings = (newSettings) => {
    setState((prev) => ({
      ...prev,
      bgSettings: {
        ...(prev.bgSettings || DEFAULT_BG_SETTINGS),
        ...newSettings,
      },
    }));
  };

  const resetBgSettings = () => {
    setState((prev) => ({
      ...prev,
      bgSettings: DEFAULT_BG_SETTINGS,
    }));
    addToast('Background wallpaper settings reset to default', 'info');
  };
  const markNoticeRead = (noticeId) => {
    setState((prev) => ({
      ...prev,
      notices: (prev.notices || []).map((n) => (n.id === noticeId ? { ...n, unread: false } : n))
    }));
  };

  const markAllNoticesRead = () => {
    setState((prev) => ({
      ...prev,
      notices: (prev.notices || []).map((n) => ({ ...n, unread: false }))
    }));
    addToast('All notices marked as read', 'info');
  };

  const submitAssignmentWork = (asgId, fileName = 'Assignment_Solution.pdf') => {
    setState((prev) => {
      const asg = (prev.assignments || []).find((a) => a.id === asgId);
      return {
        ...prev,
        assignments: (prev.assignments || []).map((a) =>
          a.id === asgId ? { ...a, status: 'Submitted' } : a
        ),
        recentActivity: [
          {
            id: `act_${Date.now()}`,
            time: 'Just now',
            title: `Submitted Assignment - ${asg?.subject || 'Coursework'}`,
            type: 'assignment',
            icon: 'file-text'
          },
          ...(prev.recentActivity || [])
        ]
      };
    });
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {
      console.log(e);
    }
    addToast('Assignment submitted successfully!', 'success');
  };

  const payFeeOnline = (amount, feeType) => {
    setState((prev) => ({
      ...prev,
      fees: {
        ...prev.fees,
        paidSoFar: (prev.fees?.paidSoFar || 0) + amount,
        dueAmount: Math.max(0, (prev.fees?.dueAmount || amount) - amount),
        transactions: [
          {
            id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
            date: 'Today',
            type: feeType || 'Semester Fee Payment',
            amount,
            mode: 'Online UPI / Card',
            status: 'Success',
            receiptNo: `REC-2025-${Math.floor(1000 + Math.random() * 9000)}`
          },
          ...(prev.fees?.transactions || [])
        ]
      }
    }));
    try {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    } catch (e) {
      console.log(e);
    }
    addToast(`Payment of ₹${amount.toLocaleString()} completed successfully!`, 'success');
  };

  const borrowBook = (bookId) => {
    setState((prev) => ({
      ...prev,
      libraryBooks: (prev.libraryBooks || []).map((b) =>
        b.id === bookId ? { ...b, available: false, dueBack: '14 Oct 2025' } : b
      )
    }));
    addToast('Book reserved & issued to your student ID!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        toasts,
        activeTab,
        setActiveTab,
        addToast,
        removeToast,
        login,
        logout,
        switchRole,
        hod,
        loadBatchTimetable,
        addSlot,
        updateSlot,
        deleteSlot,
        cancelSlot,
        saveTimetableChanges,
        generateQR,
        broadcastQR: generateQR,
        closeQR,
        submitAttendanceQR,
        askDoubt,
        replyDoubt,
        uploadMaterial,
        createAssignment,
        submitAssignment,
        submitAssignmentWork,
        gradeSubmission,
        markNoticeRead,
        markAllNoticesRead,
        payFeeOnline,
        borrowBook,
        updateBgSettings,
        resetBgSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
