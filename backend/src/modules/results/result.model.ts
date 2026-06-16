import mongoose, { Document, Schema } from 'mongoose';

export interface IResult extends Document {
  studentId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  obtainedMarks: number;
  percentage: number;
  rank: number;
}

const resultSchema = new Schema<IResult>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    obtainedMarks: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    rank: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

resultSchema.index({ studentId: 1, testId: 1 }, { unique: true });
resultSchema.index({ testId: 1, rank: 1 });

export const Result = mongoose.model<IResult>('Result', resultSchema);
