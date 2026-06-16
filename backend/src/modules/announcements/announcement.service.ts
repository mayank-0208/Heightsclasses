import { Announcement } from './announcement.model';
import { announcementRepository } from './announcement.repository';
import { User } from '../auth/user.model';
import { Batch } from '../batches/batch.model';
import { paginate } from '../../utils/pagination';
import { NotFoundError } from '../../utils/errors';
import { PaginationQuery } from '../../types';

export const announcementService = {
  create: async (data: {
    title: string;
    content: string;
    targetBatch?: string;
    createdBy: string;
  }) => {
    if (data.targetBatch) {
      const batch = await Batch.findById(data.targetBatch);
      if (!batch) throw new NotFoundError('Batch');
    }

    return announcementRepository.create({
      title: data.title,
      content: data.content,
      targetBatch: data.targetBatch as never,
      createdBy: data.createdBy as never,
      readBy: [],
    });
  },

  getAll: async (query: PaginationQuery, targetBatch?: string) => {
    const filter: Record<string, unknown> = {};
    if (targetBatch) filter.targetBatch = targetBatch;
    return paginate(Announcement, filter, query, ['title', 'content'], ['targetBatch', 'createdBy']);
  },

  getForStudent: async (studentId: string, query: PaginationQuery) => {
    const student = await User.findById(studentId);
    if (!student) throw new NotFoundError('Student');

    const filter = {
      $or: [
        { targetBatch: { $exists: false } },
        { targetBatch: null },
        { targetBatch: student.batch },
      ],
    };

    return paginate(Announcement, filter, query, ['title', 'content'], ['targetBatch', 'createdBy']);
  },

  getById: async (id: string) => {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw new NotFoundError('Announcement');
    return announcement;
  },

  markAsRead: async (id: string, userId: string) => {
    const announcement = await announcementRepository.markAsRead(id, userId);
    if (!announcement) throw new NotFoundError('Announcement');
    return announcement;
  },

  delete: async (id: string) => {
    const announcement = await announcementRepository.delete(id);
    if (!announcement) throw new NotFoundError('Announcement');
    return announcement;
  },
};
