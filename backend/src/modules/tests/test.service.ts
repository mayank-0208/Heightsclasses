import { Test } from './test.model';
import { testRepository } from './test.repository';
import { Batch } from '../batches/batch.model';
import { paginate } from '../../utils/pagination';
import { NotFoundError } from '../../utils/errors';
import { PaginationQuery } from '../../types';

export const testService = {
  create: async (data: {
    testName: string;
    subject: string;
    totalMarks: number;
    batchId: string;
    testDate: string | Date;
    createdBy: string;
  }) => {
    const batch = await Batch.findById(data.batchId);
    if (!batch) throw new NotFoundError('Batch');

    return testRepository.create({
      ...data,
      testDate: new Date(data.testDate),
      batchId: data.batchId as never,
      createdBy: data.createdBy as never,
    });
  },

  getAll: async (query: PaginationQuery, batchId?: string) => {
    const filter: Record<string, unknown> = {};
    if (batchId) filter.batchId = batchId;
    return paginate(Test, filter, query, ['testName', 'subject'], ['batchId', 'createdBy']);
  },

  getById: async (id: string) => {
    const test = await testRepository.findById(id);
    if (!test) throw new NotFoundError('Test');
    return test;
  },

  update: async (id: string, data: Partial<{
    testName: string;
    subject: string;
    totalMarks: number;
    testDate: string | Date;
  }>) => {
    const test = await testRepository.findById(id);
    if (!test) throw new NotFoundError('Test');

    const updateData = { ...data };
    if (data.testDate) updateData.testDate = new Date(data.testDate) as never;

    return testRepository.update(id, updateData as never);
  },

  delete: async (id: string) => {
    const test = await testRepository.delete(id);
    if (!test) throw new NotFoundError('Test');
    return test;
  },
};
