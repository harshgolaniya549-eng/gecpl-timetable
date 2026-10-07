import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    sr_no: {
      type: Number
    },
    student_name: {
      type: String,
      required: true,
      trim: true
    },
    roll_number: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    batch: {
      type: String,
      required: true,
      trim: true
    },
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      default: '2026'
    },
    college: {
      type: String,
      default: 'Government Engineering College Palanpur'
    },
    program: {
      type: String,
      default: 'First Semester Computer Engineering'
    },
    semester: {
      type: Number,
      default: 1
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'students'
  }
);

// Helpful index for fast queries by batch and roll_number
StudentSchema.index({ batch: 1, roll_number: 1 });

export const Student = mongoose.model('Student', StudentSchema, 'students');
