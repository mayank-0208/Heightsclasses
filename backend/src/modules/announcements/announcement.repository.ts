import { Announcement, IAnnouncement } from './announcement.model';

export const announcementRepository = {
  create: (data: Partial<IAnnouncement>): Promise<IAnnouncement> => Announcement.create(data),

  findById: (id: string): Promise<IAnnouncement | null> =>
    Announcement.findById(id)
      .populate('targetBatch', 'batchName')
      .populate('createdBy', 'fullName')
      .exec(),

  update: (id: string, data: Partial<IAnnouncement>): Promise<IAnnouncement | null> =>
    Announcement.findByIdAndUpdate(id, data, { new: true })
      .populate('targetBatch', 'batchName')
      .populate('createdBy', 'fullName')
      .exec(),

  delete: (id: string): Promise<IAnnouncement | null> => Announcement.findByIdAndDelete(id).exec(),

  markAsRead: async (id: string, userId: string): Promise<IAnnouncement | null> => {
    return Announcement.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: userId } },
      { new: true }
    )
      .populate('targetBatch', 'batchName')
      .populate('createdBy', 'fullName')
      .exec();
  },
};
