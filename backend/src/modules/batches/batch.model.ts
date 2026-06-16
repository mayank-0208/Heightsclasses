import mongoose, { Document, Schema } from 'mongoose';

export interface IBatch extends Document {
  batchName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  assignedTeacher: mongoose.Types.ObjectId;
  isActive: boolean;
}

const batchSchema = new Schema<IBatch>(
  {
    batchName: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    assignedTeacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Batch = mongoose.model<IBatch>('Batch', batchSchema);
