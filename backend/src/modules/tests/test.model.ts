import mongoose, { Document, Schema } from 'mongoose';

export interface ITest extends Document {
  testName: string;
  subject: string;
  totalMarks: number;
  batchId: mongoose.Types.ObjectId;
  testDate: Date;
  createdBy: mongoose.Types.ObjectId;
}

const testSchema = new Schema<ITest>(
  {
    testName: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    totalMarks: { type: Number, required: true, min: 1 },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    testDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

testSchema.index({ batchId: 1, testDate: -1 });

export const Test = mongoose.model<ITest>('Test', testSchema);
