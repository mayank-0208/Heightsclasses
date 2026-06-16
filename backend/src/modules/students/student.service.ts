import mongoose from 'mongoose';
import { studentRepository } from './student.repository';
import { authRepository } from '../auth/auth.repository';
import { User } from '../auth/user.model';
import { Fee } from '../fees/fee.model';
import { Batch } from '../batches/batch.model';
import { generateStudentId } from '../../utils/helpers';
import { paginate } from '../../utils/pagination';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { PaginationQuery } from '../../types';

export const studentService = {
  create: async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    batch: string;
    fatherName: string;
    motherName: string;
    address: string;
    joiningDate: string | Date;
    dateOfBirth: string | Date;
    emergencyContact: string;
    totalFee?: number;
    dueDate?: string | Date;
  }) => {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already registered');

    const batch = await Batch.findById(data.batch);
    if (!batch) throw new NotFoundError('Batch');

    const hashed = await authRepository.hashPassword(data.password);
    const studentId = generateStudentId();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.create(
        [
          {
            fullName: data.fullName,
            studentId,
            email: data.email,
            phone: data.phone,
            password: hashed,
            role: 'student',
            batch: data.batch,
            mustChangePassword: true,
            isActive: true,
          },
        ],
        { session }
      );

      const profile = await studentRepository.create({
        userId: user[0]._id,
        fatherName: data.fatherName,
        motherName: data.motherName,
        address: data.address,
        joiningDate: new Date(data.joiningDate),
        dateOfBirth: new Date(data.dateOfBirth),
        emergencyContact: data.emergencyContact,
      });

      if (data.totalFee !== undefined) {
        const totalFee = data.totalFee;
        await Fee.create(
          [
            {
              studentId: user[0]._id,
              totalFee,
              paidFee: 0,
              pendingFee: totalFee,
              dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
              paymentHistory: [],
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();
      return { user: user[0], profile };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  getAll: async (query: PaginationQuery, batchId?: string) => {
    const filter: Record<string, unknown> = { role: 'student' };
    if (batchId) filter.batch = batchId;
    return paginate(User, filter, query, ['fullName', 'email', 'studentId'], 'batch');
  },

  getById: async (id: string) => {
    const user = await authRepository.findById(id);
    if (!user || user.role !== 'student') throw new NotFoundError('Student');

    const profile = await studentRepository.findByUserId(id);
    return { user, profile };
  },

  update: async (
    id: string,
    userData: Record<string, unknown>,
    profileData: Record<string, unknown>
  ) => {
    const user = await authRepository.findById(id);
    if (!user || user.role !== 'student') throw new NotFoundError('Student');

    const updatedUser = await authRepository.update(id, userData as never);
    const profile = await studentRepository.findByUserId(id);

    let updatedProfile = profile;
    if (profile && Object.keys(profileData).length > 0) {
      updatedProfile = await studentRepository.update(profile._id.toString(), profileData as never);
    }

    return { user: updatedUser, profile: updatedProfile };
  },

  getByBatch: async (batchId: string) => {
  const batch = await Batch.findById(batchId);
    if (!batch) throw new NotFoundError('Batch');

    return User.find({ role: 'student', batch: batchId, isActive: true })
      .populate('batch')
      .sort({ fullName: 1 })
      .exec();
  },
};
