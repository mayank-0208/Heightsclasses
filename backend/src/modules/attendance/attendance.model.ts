import mongoose, { Document, Schema } from 'mongoose';
import { AttendanceStatus } from '../../types';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  date: Date;
  entryTime?: string;
  exitTime?: string;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    entryTime: { type: String },
    exitTime: { type: String },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half-Day'],
      required: true,
    },
    remarks: { type: String, trim: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
