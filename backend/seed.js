import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Faculty } from './models/Faculty.js';
import { Student } from './models/Student.js';
import { Timetable } from './models/Timetable.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Possible directories where JSON data files live
const SEARCH_DIRS = [
  path.resolve(__dirname, './data'),
  path.resolve(__dirname, '../src/data'),
  path.resolve(__dirname, '../frontend/src/data')
];

const findFile = (filename) => {
  for (const dir of SEARCH_DIRS) {
    const full = path.join(dir, filename);
    if (fs.existsSync(full)) {
      return full;
    }
  }
  return null;
};

const readJsonFile = (filename) => {
  const filePath = findFile(filename);
  if (!filePath) {
    return null;
  }
  try {
    let content = fs.readFileSync(filePath, 'utf-8').trim();
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1).trim();
    }
    if (!content || content === '{}') return null;

    // Try normal JSON parse
    try {
      return JSON.parse(content);
    } catch (parseErr) {
      // Handle multiple JSON root objects (e.g. concatenated CP1, CP2, CP3 timetables)
      const cleanParts = content
        .split(/(?<=\})\s*(?=\{)/g)
        .map((p) => p.trim())
        .filter(Boolean);

      const parsedObjects = [];
      for (const part of cleanParts) {
        try {
          parsedObjects.push(JSON.parse(part));
        } catch (e) {
          // ignore chunk parse failure
        }
      }

      if (parsedObjects.length > 0) {
        return parsedObjects;
      }

      console.warn(`[Seed Warning] Could not parse ${filename}: ${parseErr.message}`);
      return null;
    }
  } catch (err) {
    console.warn(`[Seed Warning] Error reading ${filename}: ${err.message}`);
    return null;
  }
};

export const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_manage_sys';
  console.log(`\n======================================================`);
  console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
  console.log(`======================================================\n`);

  await mongoose.connect(mongoUri);
  console.log(`[Seed] Connected to database: ${mongoose.connection.name}`);

  // 1. Seed Faculty Collection
  console.log(`\n--- Seeding 'faculty' Collection ---`);
  let profData = readJsonFile('professor.json') || readJsonFile('profeser.json');

  const defaultProfessors = [
    {
      role: 'HOD',
      name: 'DR. R. H. JAISWAL',
      designation: 'ASSOCIATE PROFESSOR',
      qualification: 'PH.D.',
      experience: '26 YEARS',
      area_of_interest: ['INFORMATION SECURITY', 'CYBER SECURITY', 'DIGITAL FORENSICS', 'IOT', 'OOP'],
      username: 'dr.rh.jaiswal',
      user_id: 'HOD_RHJ',
      password: '2026',
      college: 'Government Engineering College, Palanpur',
      department: 'Computer Engineering Department'
    },
    {
      role: 'ASSISTANT PROFESSOR',
      name: 'PROF. K. M. GOHEL',
      designation: 'ASSISTANT PROFESSOR',
      qualification: 'M.E. (Electronics & Communication)',
      experience: '2 YEARS',
      area_of_interest: ['ELECTRONICS'],
      username: 'prof.km.gohel',
      user_id: 'PROF_KMG',
      password: '2026',
      college: 'Government Engineering College, Palanpur',
      department: 'Computer Engineering Department'
    }
  ];

  let facultyUsers = [];
  if (profData && Array.isArray(profData.users) && profData.users.length > 0) {
    facultyUsers = profData.users.map((u) => ({
      ...u,
      college: profData.college,
      department: profData.department
    }));
  } else {
    facultyUsers = defaultProfessors;
  }

  await Faculty.deleteMany({});
  const facultyDocs = facultyUsers.map((user) => ({
    role: user.role || 'FACULTY',
    name: user.name,
    designation: user.designation || 'PROFESSOR',
    qualification: user.qualification || '',
    experience: user.experience || '',
    area_of_interest: Array.isArray(user.area_of_interest) ? user.area_of_interest : [],
    username: user.username || user.user_id?.toLowerCase(),
    user_id: user.user_id,
    password: user.password || '2026',
    college: user.college || 'Government Engineering College, Palanpur',
    department: user.department || 'Computer Engineering Department',
    email: `${(user.username || user.user_id || 'faculty').toLowerCase()}@gecp.ac.in`,
    phone: '+91 98220 11223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }));

  await Faculty.insertMany(facultyDocs);
  console.log(`✓ Inserted ${facultyDocs.length} faculty members into 'faculty' collection.`);

  // 2. Seed Students Collection
  console.log(`\n--- Seeding 'students' Collection ---`);
  await Student.deleteMany({});

  const studentFiles = [
    'student cp 1.json',
    'student cp 2.json',
    'student cp3.json'
  ];

  const studentDocs = [];
  const seenRolls = new Set();

  for (const file of studentFiles) {
    const data = readJsonFile(file);
    if (!data) continue;

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.students)
      ? data.students
      : [];

    const defaultBatch =
      data.batch ||
      (file.toLowerCase().includes('cp 1') || file.toLowerCase().includes('cp1')
        ? 'CP1'
        : file.toLowerCase().includes('cp 2') || file.toLowerCase().includes('cp2')
        ? 'CP2'
        : 'CP3');

    const defaultCollege = data.college || 'Government Engineering College Palanpur';
    const defaultProgram = data.program || 'First Semester Computer Engineering';

    console.log(`Processing ${file} (Batch: ${defaultBatch}, Found: ${list.length})...`);

    for (const s of list) {
      const roll = (s.roll_number || s.temp_roll_no || s.roll_no || '').trim().toUpperCase();
      if (!roll || seenRolls.has(roll)) continue;
      seenRolls.add(roll);

      studentDocs.push({
        sr_no: s.sr_no,
        student_name: s.student_name,
        roll_number: roll,
        batch: (s.batch || defaultBatch).toUpperCase(),
        user_id: (s.user_id || roll).trim(),
        password: s.password || '2026',
        college: s.college || defaultCollege,
        program: s.program || defaultProgram,
        semester: 1,
        email: `${roll.toLowerCase()}@gecp.ac.in`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      });
    }
  }

  if (studentDocs.length > 0) {
    await Student.insertMany(studentDocs);
    console.log(`✓ Inserted ${studentDocs.length} students into 'students' collection.`);
  }

  // 3. Seed Timetable Collection
  console.log(`\n--- Seeding 'timetable' Collection ---`);
  await Timetable.deleteMany({});

  const timetableFiles = [
    'time table.json',
    'time table cp1.json',
    'time table cp2.json',
    'time table cp3.json',
    'cp1 timetable.json'
  ];

  const timetableDocs = [];
  const seenBatches = new Set();

  for (const file of timetableFiles) {
    const data = readJsonFile(file);
    if (!data) continue;

    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      if (item && item.timetable && item.batch && !seenBatches.has(item.batch)) {
        seenBatches.add(item.batch);
        timetableDocs.push({
          college: item.college || 'Government Engineering College, Palanpur',
          department: item.department || 'Computer Engineering Department',
          academic_year: item.academic_year || '2026-27',
          semester: item.semester || 'Odd',
          academic_term: item.academic_term || '1/7/2026 to 11/12/2026',
          effective_from: item.effective_from || '13-8-2026',
          batch: item.batch,
          timetable: item.timetable
        });
        console.log(`✓ Loaded timetable for Batch: ${item.batch}`);
      }
    }
  }

  if (timetableDocs.length > 0) {
    await Timetable.insertMany(timetableDocs);
    console.log(`✓ Inserted ${timetableDocs.length} timetables into 'timetable' collection.`);
  }

  console.log(`\n======================================================`);
  console.log(`[Seed Summary]`);
  console.log(`- Database:   ${mongoose.connection.name}`);
  console.log(`- Faculty:    ${facultyDocs.length} documents in 'faculty'`);
  console.log(`- Students:   ${studentDocs.length} documents in 'students'`);
  console.log(`- Timetable:  ${timetableDocs.length} documents in 'timetable'`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
  console.log(`[Seed] Disconnected from MongoDB. Seed complete!`);
};

seedDatabase().catch((err) => {
  console.error(`[Seed Error]:`, err);
  process.exit(1);
});
