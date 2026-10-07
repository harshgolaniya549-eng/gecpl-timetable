import express from 'express';
import { Student } from '../models/Student.js';

const router = express.Router();

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// GET /api/students - List all students with optional batch or search filter
router.get('/', async (req, res) => {
  try {
    const { batch, search } = req.query;
    const query = {};

    if (batch && batch.trim()) {
      query.batch = batch.trim().toUpperCase();
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      query.$or = [
        { student_name: { $regex: safeSearch, $options: 'i' } },
        { roll_number: { $regex: safeSearch, $options: 'i' } },
        { user_id: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).sort({ roll_number: 1 });
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/roll/:rollNumber - Fetch student by roll number
router.get('/roll/:rollNumber', async (req, res) => {
  try {
    const rollTrim = req.params.rollNumber?.trim();
    if (!rollTrim) {
      return res.status(400).json({ success: false, message: 'Roll number is required' });
    }

    const student = await Student.findOne({
      roll_number: { $regex: `^${escapeRegex(rollTrim)}$`, $options: 'i' }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: `Student with roll number ${rollTrim} not found` });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/:id - Fetch single student by mongo ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students/login - Student login authentication
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your Roll Number, Name, or User ID'
      });
    }

    const cleanInput = identifier.trim();
    const compactInput = cleanInput.replace(/\s+/g, '');
    const safeInput = escapeRegex(cleanInput);
    const safeCompact = escapeRegex(compactInput);

    // Build conditions to match roll_number, user_id, email, or student_name
    const strippedRoll = cleanInput.replace(/[^a-zA-Z0-9]/g, '');
    const matchConditions = [
      { roll_number: { $regex: `^${safeCompact}$`, $options: 'i' } },
      { roll_number: { $regex: `^${safeInput}$`, $options: 'i' } },
      { user_id: { $regex: `^${safeCompact}$`, $options: 'i' } },
      { user_id: { $regex: `^${safeInput}$`, $options: 'i' } },
      { email: { $regex: `^${safeInput}$`, $options: 'i' } },
      { student_name: { $regex: safeInput, $options: 'i' } }
    ];

    if (strippedRoll) {
      matchConditions.push({ roll_number: { $regex: `^${escapeRegex(strippedRoll)}$`, $options: 'i' } });
      matchConditions.push({ user_id: { $regex: `^${escapeRegex(strippedRoll)}$`, $options: 'i' } });
    }

    const words = cleanInput.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      // Match all words regardless of order (e.g. "Harsh Tiwari" matches "Harsh Rajkishor Tiwari")
      const lookaheads = words.map((w) => `(?=.*${escapeRegex(w)})`).join('');
      matchConditions.push({ student_name: { $regex: lookaheads, $options: 'i' } });
    }

    // If numeric e.g. "14" or "52", also match "CE14", "CE01", "CE52" or sr_no
    if (/^\d+$/.test(cleanInput)) {
      const num = parseInt(cleanInput, 10);
      const paddedNum = num < 10 ? `0${num}` : `${num}`;
      matchConditions.push({ roll_number: { $regex: `^CE0*${num}$`, $options: 'i' } });
      matchConditions.push({ roll_number: `CE${paddedNum}` });
      matchConditions.push({ sr_no: num });
    }

    const student = await Student.findOne({ $or: matchConditions }).sort({ roll_number: 1 });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found for "${cleanInput}". Try Roll Number (e.g. CE14, CE52) or Name (e.g. Harsh).`
      });
    }

    const enteredPassword = password !== undefined && password !== null ? String(password).trim() : '';
    const storedPassword = student.password && student.password.trim() ? student.password.trim() : '2026';

    // Allow empty password to default to '2026', or match stored/default password
    const validPassword = enteredPassword === storedPassword || enteredPassword === '2026' || enteredPassword === '';

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Default campus password is: 2026'
      });
    }

    res.json({
      success: true,
      message: `Welcome back, ${student.student_name}! (${student.roll_number})`,
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students - Create new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
