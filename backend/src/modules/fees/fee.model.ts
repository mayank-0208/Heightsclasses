import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentRecord {
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
  recordedBy: mongoose.Types.ObjectId;
}

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId;
  totalFee: number;
  paidFee: number;
  pendingFee: number;
  dueDate: Date;
  paymentHistory: IPaymentRecord[];
}

const paymentRecordSchema = new Schema<IPaymentRecord>(
  {
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true },
    paymentMethod: { type: String, required: true, trim: true },
    transactionId: { type: String, trim: true },
    remarks: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: true }
);

const feeSchema = new Schema<IFee>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalFee: { type: Number, required: true, min: 0 },
    paidFee: { type: Number, required: true, default: 0, min: 0 },
    pendingFee: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paymentHistory: [paymentRecordSchema],
  },
  { timestamps: true }
);

feeSchema.index({ dueDate: 1 });
feeSchema.index({ pendingFee: 1 });

export const Fee = mongoose.model<IFee>('Fee', feeSchema);
