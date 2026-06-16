import { Fee, IFee } from './fee.model';

export const feeRepository = {
  create: (data: Partial<IFee>): Promise<IFee> => Fee.create(data),

  findById: (id: string): Promise<IFee | null> =>
    Fee.findById(id).populate('studentId', 'fullName studentId email batch').exec(),

  findByStudent: (studentId: string): Promise<IFee | null> =>
    Fee.findOne({ studentId }).populate('studentId', 'fullName studentId email batch').exec(),

  update: (id: string, data: Partial<IFee>): Promise<IFee | null> =>
    Fee.findByIdAndUpdate(id, data, { new: true })
      .populate('studentId', 'fullName studentId email batch')
      .exec(),

  findDefaulters: (): Promise<IFee[]> =>
    Fee.find({ pendingFee: { $gt: 0 }, dueDate: { $lt: new Date() } })
      .populate('studentId', 'fullName studentId email phone batch')
      .sort({ dueDate: 1 })
      .exec(),

  getPendingTotal: async (): Promise<number> => {
    const result = await Fee.aggregate([{ $group: { _id: null, total: { $sum: '$pendingFee' } } }]);
    return result[0]?.total || 0;
  },
};
