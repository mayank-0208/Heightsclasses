import { Fee } from './fee.model';
import { feeRepository } from './fee.repository';
import { User } from '../auth/user.model';
import { paginate } from '../../utils/pagination';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors';
import { PaginationQuery } from '../../types';

export const feeService = {
  create: async (data: { studentId: string; totalFee: number; dueDate: string | Date }) => {
    const student = await User.findOne({ _id: data.studentId, role: 'student' });
    if (!student) throw new NotFoundError('Student');

    const existing = await feeRepository.findByStudent(data.studentId);
    if (existing) throw new ConflictError('Fee record already exists for this student');

    return feeRepository.create({
      studentId: data.studentId as never,
      totalFee: data.totalFee,
      paidFee: 0,
      pendingFee: data.totalFee,
      dueDate: new Date(data.dueDate),
      paymentHistory: [],
    });
  },

  getAll: async (query: PaginationQuery, hasPending?: boolean) => {
    const filter: Record<string, unknown> = {};
    if (hasPending) filter.pendingFee = { $gt: 0 };
    return paginate(Fee, filter, query, [], 'studentId');
  },

  getByStudent: async (studentId: string) => {
    const fee = await feeRepository.findByStudent(studentId);
    if (!fee) throw new NotFoundError('Fee record');
    return fee;
  },

  recordPayment: async (
    id: string,
    payment: {
      amount: number;
      paymentDate: string | Date;
      paymentMethod: string;
      transactionId?: string;
      remarks?: string;
      recordedBy: string;
    }
  ) => {
    const fee = await feeRepository.findById(id);
    if (!fee) throw new NotFoundError('Fee record');

    if (payment.amount > fee.pendingFee) {
      throw new ValidationError('Payment amount exceeds pending fee');
    }

    const paidFee = fee.paidFee + payment.amount;
    const pendingFee = fee.totalFee - paidFee;

    return feeRepository.update(id, {
      paidFee,
      pendingFee,
      paymentHistory: [
        ...fee.paymentHistory,
        {
          amount: payment.amount,
          paymentDate: new Date(payment.paymentDate),
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          remarks: payment.remarks,
          recordedBy: payment.recordedBy as never,
        },
      ],
    });
  },

  getDefaulters: async () => feeRepository.findDefaulters(),

  getPendingReport: async () => {
    const fees = await Fee.find({ pendingFee: { $gt: 0 } })
      .populate('studentId', 'fullName studentId email batch')
      .sort({ pendingFee: -1 })
      .exec();

    const totalPending = fees.reduce((sum, f) => sum + f.pendingFee, 0);
    return { fees, totalPending, count: fees.length };
  },
};
