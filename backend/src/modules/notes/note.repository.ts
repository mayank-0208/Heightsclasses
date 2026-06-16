import { Note, INote } from './note.model';

export const noteRepository = {
  create: (data: Partial<INote>): Promise<INote> => Note.create(data),

  findById: (id: string): Promise<INote | null> =>
    Note.findById(id)
      .populate('batchId', 'batchName')
      .populate('uploadedBy', 'fullName')
      .exec(),

  delete: (id: string): Promise<INote | null> => Note.findByIdAndDelete(id).exec(),

  countRecent: (uploadedBy: string, days = 7): Promise<number> => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return Note.countDocuments({ uploadedBy, uploadedAt: { $gte: since } }).exec();
  },
};
