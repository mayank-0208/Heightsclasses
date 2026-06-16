import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  targetBatch?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    targetBatch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

announcementSchema.index({ targetBatch: 1, createdAt: -1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
