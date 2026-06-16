import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  description: string;
  subject: string;
  batchId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

noteSchema.index({ batchId: 1, subject: 1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
