import { Batch, IBatch } from './batch.model';
import { User } from '../auth/user.model';

export const batchRepository = {
  create: (data: Partial<IBatch>): Promise<IBatch> => Batch.create(data),

  findById: (id: string): Promise<IBatch | null> =>
    Batch.findById(id).populate('assignedTeacher', 'fullName email').exec(),

  update: (id: string, data: Partial<IBatch>): Promise<IBatch | null> =>
    Batch.findByIdAndUpdate(id, data, { new: true }).populate('assignedTeacher', 'fullName email').exec(),

  delete: (id: string): Promise<IBatch | null> => Batch.findByIdAndDelete(id).exec(),

  findByTeacher: (teacherId: string): Promise<IBatch[]> =>
    Batch.find({ assignedTeacher: teacherId, isActive: true })
      .populate('assignedTeacher', 'fullName email')
      .exec(),

  countActive: (): Promise<number> => Batch.countDocuments({ isActive: true }).exec(),
};
