import { Student, IStudent } from './student.model';
import { User } from '../auth/user.model';

export const studentRepository = {
  create: (data: Partial<IStudent>): Promise<IStudent> => Student.create(data),

  findByUserId: (userId: string): Promise<IStudent | null> =>
    Student.findOne({ userId }).populate('userId').exec(),

  findById: (id: string): Promise<IStudent | null> =>
    Student.findById(id).populate('userId').exec(),

  update: (id: string, data: Partial<IStudent>): Promise<IStudent | null> =>
    Student.findByIdAndUpdate(id, data, { new: true }).populate('userId').exec(),

  delete: (id: string): Promise<IStudent | null> => Student.findByIdAndDelete(id).exec(),

  getStudentsWithUsers: async (filter: Record<string, unknown> = {}) => {
    const students = await User.find({ role: 'student', ...filter })
      .populate('batch')
      .sort({ createdAt: -1 })
      .exec();

    const studentProfiles = await Student.find({
      userId: { $in: students.map((s) => s._id) },
    }).exec();

    const profileMap = new Map(studentProfiles.map((p) => [p.userId.toString(), p]));

    return students.map((user) => ({
      user,
      profile: profileMap.get(user._id.toString()) || null,
    }));
  },
};
