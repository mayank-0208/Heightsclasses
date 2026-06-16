import { Batch } from './batch.model';
import { batchRepository } from './batch.repository';
import { User } from '../auth/user.model';
import { paginate } from '../../utils/pagination';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { PaginationQuery } from '../../types';

export const batchService = {
  create: async (data: {
    batchName: string;
    description: string;
    startDate: string | Date;
    endDate: string | Date;
    assignedTeacher: string;
  }) => {
    const existing = await Batch.findOne({ batchName: data.batchName });
    if (existing) throw new ConflictError('Batch name already exists');

    const teacher = await User.findOne({ _id: data.assignedTeacher, role: 'teacher' });
    if (!teacher) throw new NotFoundError('Teacher');

    return batchRepository.create({
      batchName: data.batchName,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      assignedTeacher: data.assignedTeacher as never,
    });
  },

  getAll: async (query: PaginationQuery, isActive?: boolean) => {
    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) filter.isActive = isActive;
    return paginate(Batch, filter, query, ['batchName', 'description'], 'assignedTeacher');
  },

  getById: async (id: string) => {
    const batch = await batchRepository.findById(id);
    if (!batch) throw new NotFoundError('Batch');
    return batch;
  },

  update: async (id: string, data: Partial<{
    batchName: string;
    description: string;
    startDate: string | Date;
    endDate: string | Date;
    assignedTeacher: string;
    isActive: boolean;
  }>) => {
    const batch = await batchRepository.findById(id);
    if (!batch) throw new NotFoundError('Batch');

    if (data.assignedTeacher) {
      const teacher = await User.findOne({ _id: data.assignedTeacher, role: 'teacher' });
      if (!teacher) throw new NotFoundError('Teacher');
    }

    const updateData = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate) as never;
    if (data.endDate) updateData.endDate = new Date(data.endDate) as never;

    const updated = await batchRepository.update(id, updateData as never);
    return updated;
  },

  getByTeacher: async (teacherId: string) => batchRepository.findByTeacher(teacherId),
};
