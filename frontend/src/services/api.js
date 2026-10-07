// API URL configuration:
// Defaults to relative '/api' so Vite proxy forwards requests seamlessly
// on localhost, LAN IP (e.g. mobile testing), and untun / Cloudflare tunnels.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Robust fetch helper that attempts relative '/api' endpoint (Vite proxy/tunnel)
 * and falls back to direct 'http://localhost:5000/api' if on localhost or proxy errors.
 */
const safeFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  let res;
  let shouldFallback = false;

  // Use AbortController with 3000ms timeout so requests never hang
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  const reqOptions = {
    ...options,
    signal: options.signal || ctrl.signal,
  };

  try {
    res = await fetch(url, reqOptions);
    clearTimeout(timer);
    // If Vite proxy returns gateway/proxy error codes (502, 503, 504), trigger direct fallback
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      shouldFallback = true;
    }
  } catch (err) {
    clearTimeout(timer);
    shouldFallback = true;
  }

  if (shouldFallback) {
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === ''
    );
    if (isLocal) {
      const fallbackCtrl = new AbortController();
      const fallbackTimer = setTimeout(() => fallbackCtrl.abort(), 3000);
      try {
        const directRes = await fetch(`http://127.0.0.1:5000/api${endpoint}`, {
          ...options,
          signal: options.signal || fallbackCtrl.signal,
        });
        clearTimeout(fallbackTimer);
        return directRes;
      } catch (directErr) {
        clearTimeout(fallbackTimer);
        if (res) return res;
        throw new Error('Backend server is not running on port 5000. Please start the backend.');
      }
    }
  }

  return res;
};

/**
 * Safely parse JSON response and provide meaningful error if server returned HTML or non-JSON
 */
const parseJsonResponse = async (res, defaultMsg = 'Request failed') => {
  if (!res) {
    throw new Error(`${defaultMsg}: No response received from server.`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${defaultMsg} (Server returned HTTP ${res.status})`);
  }
};

/**
 * Format raw MongoDB timetable schedule into UI lecture cards
 * @param {Object} rawTimetable - e.g. { Monday: [ ["10:30 to 11:30", "BME", "AKP", "8109"], ... ] }
 * @param {string} batch - e.g. "CP1", "CP2", "CP3"
 */
export const formatTimetableForUI = (rawTimetable, batch = 'CP1') => {
  if (!rawTimetable || typeof rawTimetable !== 'object') return [];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const formattedSlots = [];

  for (const day of days) {
    const slots = rawTimetable[day];
    if (Array.isArray(slots)) {
      slots.forEach((slot, index) => {
        let time, subject, faculty, room, status, notes;

        if (Array.isArray(slot)) {
          if (slot.length < 2) return;
          [time, subject, faculty, room] = slot;
        } else if (typeof slot === 'object' && slot !== null) {
          time = slot.time || slot.timeStr || slot.startTime;
          subject = slot.subject;
          faculty = slot.faculty || slot.facultyName || slot.professorName;
          room = slot.room;
          status = slot.status;
          notes = slot.notes;
        } else {
          return;
        }

        // Skip "No CP class listed" or empty slots
        if (subject && subject.toLowerCase().includes('no ') && subject.toLowerCase().includes('class')) {
          return;
        }

        const roomDisplay = room
          ? (room.toString().startsWith('Room') ? room : `Room ${room}`)
          : 'Academic Block C';

        formattedSlots.push({
          id: slot.id || `${batch}-${day}-${index}-${time}`.replace(/\s+/g, '_'),
          batch,
          day,
          time: time || '10:30 to 11:30',
          timeStr: time || '10:30 to 11:30',
          startTime: slot.startTime || (time ? time.split('to')[0]?.trim() : '10:30 AM'),
          endTime: slot.endTime || (time ? time.split('to')[1]?.trim() : '11:30 AM'),
          subject: subject || 'Self Study / Library',
          code: slot.code || subject?.split(' ')[0] || 'GEN',
          faculty: faculty || 'Staff / Self',
          facultyName: faculty || 'Department Faculty',
          professorName: faculty || 'Department Faculty',
          room: roomDisplay,
          type: slot.type || (subject?.toLowerCase().includes('lab') ? 'Lab' : 'Lecture'),
          status: status || slot.status || 'Scheduled',
          notes: notes || slot.notes || '',
          attendanceMarked: false
        });
      });
    }
  }

  return formattedSlots;
};

export const api = {
  // Health Check
  checkHealth: async () => {
    try {
      const res = await safeFetch('/health');
      return await res.json();
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  },

  // Student Authentication with proper validation
  studentLogin: async (identifier, password) => {
    if (!identifier || !identifier.trim()) {
      throw new Error('Please enter your Roll Number, Name, or User ID');
    }
    const cleanPwd = password && password.trim() ? password.trim() : '2026';

    const res = await safeFetch('/students/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), password: cleanPwd })
    });
    const data = await parseJsonResponse(res, 'Student login failed');
    if (!res.ok) {
      throw new Error(data.message || 'Student login failed');
    }
    return data;
  },

  // Faculty Authentication with proper validation
  facultyLogin: async (identifier, password) => {
    if (!identifier || !identifier.trim()) {
      throw new Error('Please enter your Username, Name, or Faculty User ID');
    }
    const cleanPwd = password && password.trim() ? password.trim() : '2026';

    const res = await safeFetch('/faculty/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), password: cleanPwd })
    });
    const data = await parseJsonResponse(res, 'Faculty login failed');
    if (!res.ok) {
      throw new Error(data.message || 'Faculty login failed');
    }
    return data;
  },

  // Get Timetable for Batch (e.g. CP1, CP2, CP3)
  getTimetable: async (batch = 'CP1') => {
    const res = await safeFetch(`/timetable/${batch.toUpperCase()}`);
    const data = await parseJsonResponse(res, `Failed to fetch timetable for batch ${batch}`);
    if (!res.ok) {
      throw new Error(data.message || `Failed to fetch timetable for batch ${batch}`);
    }
    return data.data;
  },

  // Get All Timetables
  getAllTimetables: async () => {
    const res = await safeFetch('/timetable');
    const data = await parseJsonResponse(res, 'Failed to fetch timetables');
    if (!res.ok) throw new Error(data.message || 'Failed to fetch timetables');
    return data.data;
  },

  // Save/Update Timetable for Batch
  saveTimetable: async (batch, timetableData) => {
    const res = await safeFetch('/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch: batch.toUpperCase(), timetable: timetableData })
    });
    const data = await parseJsonResponse(res, `Failed to save timetable for batch ${batch}`);
    if (!res.ok) throw new Error(data.message || `Failed to save timetable for batch ${batch}`);
    return data.data;
  },

  // Get Students with optional batch and search query
  getStudents: async (batch, search) => {
    const params = new URLSearchParams();
    if (batch && batch !== 'All') params.append('batch', batch.toUpperCase());
    if (search && search.trim()) params.append('search', search.trim());
    
    const endpoint = params.toString() ? `/students?${params.toString()}` : '/students';
    const res = await safeFetch(endpoint);
    const data = await parseJsonResponse(res, 'Failed to fetch students');
    if (!res.ok) throw new Error(data.message || 'Failed to fetch students');
    return data.data;
  },

  // Get Single Student by Roll Number
  getStudentByRoll: async (rollNumber) => {
    const res = await safeFetch(`/students/roll/${encodeURIComponent(rollNumber.trim().toUpperCase())}`);
    const data = await parseJsonResponse(res, 'Failed to fetch student');
    if (!res.ok) throw new Error(data.message || 'Failed to fetch student');
    return data.data;
  },

  // Get Faculty Members
  getFaculty: async (search) => {
    const endpoint = search ? `/faculty?search=${encodeURIComponent(search.trim())}` : '/faculty';
    const res = await safeFetch(endpoint);
    const data = await parseJsonResponse(res, 'Failed to fetch faculty');
    if (!res.ok) throw new Error(data.message || 'Failed to fetch faculty');
    return data.data;
  }
};
