import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema(
  {
    college: {
      type: String,
      default: 'Government Engineering College, Palanpur'
    },
    department: {
      type: String,
      default: 'Computer Engineering Department'
    },
    academic_year: {
      type: String,
      default: '2026-27'
    },
    semester: {
      type: String,
      default: 'Odd'
    },
    academic_term: {
      type: String,
      default: '1/7/2026 to 11/12/2026'
    },
    effective_from: {
      type: String,
      default: '13-8-2026'
    },
    batch: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    timetable: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'timetable'
  }
);

export const Timetable = mongoose.model('Timetable', TimetableSchema, 'timetable');
