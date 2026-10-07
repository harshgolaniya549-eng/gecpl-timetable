import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_manage_sys';

async function check() {
  await mongoose.connect(uri);
  const students = await mongoose.connection.db.collection('students').find().toArray();
  const matched = students.filter(s => 
    s.student_name.toLowerCase().includes('harsh') || 
    s.roll_number.toLowerCase().includes('14') ||
    s.roll_number.toLowerCase().includes('52')
  );
  console.log('Matched students count:', matched.length);
  matched.forEach(s => {
    console.log(`- Roll: [${s.roll_number}], Name: "${s.student_name}", Batch: [${s.batch}], Pwd: [${s.password}]`);
  });
  await mongoose.disconnect();
  process.exit(0);
}

check();

