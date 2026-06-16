import { Test, ITest } from './test.model';

export const testRepository = {
  create: (data: Partial<ITest>): Promise<ITest> => Test.create(data),

  findById: (id: string): Promise<ITest | null> =>
    Test.findById(id).populate('batchId', 'batchName').populate('createdBy', 'fullName').exec(),

  update: (id: string, data: Partial<ITest>): Promise<ITest | null> =>
    Test.findByIdAndUpdate(id, data, { new: true })
      .populate('batchId', 'batchName')
      .populate('createdBy', 'fullName')
      .exec(),

  delete: (id: string): Promise<ITest | null> => Test.findByIdAndDelete(id).exec(),

  countAll: (): Promise<number> => Test.countDocuments().exec(),
};
