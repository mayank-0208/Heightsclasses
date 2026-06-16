import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../../types';

export interface IUser extends Document {
  fullName: string;
  studentId?: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  batch?: mongoose.Types.ObjectId;
  isActive: boolean;
  mustChangePassword: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    studentId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ batch: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
