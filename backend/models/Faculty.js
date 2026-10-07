import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: 'FACULTY'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      default: 'ASSISTANT PROFESSOR'
    },
    qualification: {
      type: String,
      default: ''
    },
    experience: {
      type: String,
      default: ''
    },
    area_of_interest: {
      type: [String],
      default: []
    },
    username: {
      type: String,
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
      default: 'Government Engineering College, Palanpur'
    },
    department: {
      type: String,
      default: 'Computer Engineering Department'
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
    collection: 'faculty'
  }
);

export const Faculty = mongoose.model('Faculty', FacultySchema, 'faculty');
