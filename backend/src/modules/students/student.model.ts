import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  fatherName: string;
  motherName: string;
  address: string;
  joiningDate: Date;
  dateOfBirth: Date;
  emergencyContact: string;
  profileImage?: string;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    dateOfBirth: { type: Date, required: true },
    emergencyContact: { type: String, required: true, trim: true },
    profileImage: { type: String },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>('Student', studentSchema);
