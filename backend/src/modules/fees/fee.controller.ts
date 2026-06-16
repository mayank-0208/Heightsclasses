import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { feeService } from './fee.service';
import { ForbiddenError } from '../../utils/errors';
import { asString } from '../../utils/helpers';

export const feeController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fee = await feeService.create(req.body);
      sendSuccess(res, fee, 201);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hasPending = req.query.hasPending === 'true';
      const result = await feeService.getAll(req.query, hasPending);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByStudent: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = asString(req.params.studentId);
      if (req.user!.role === 'student' && req.user!.userId !== studentId) {
        throw new ForbiddenError('Cannot access other student fees');
      }
      const fee = await feeService.getByStudent(studentId);
      sendSuccess(res, fee);
    } catch (error) {
      next(error);
    }
  },

  recordPayment: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fee = await feeService.recordPayment(asString(req.params.id), {
        ...req.body,
        recordedBy: req.user!.userId,
      });
      sendSuccess(res, fee);
    } catch (error) {
      next(error);
    }
  },

  getDefaulters: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const defaulters = await feeService.getDefaulters();
      sendSuccess(res, defaulters);
    } catch (error) {
      next(error);
    }
  },

  getPendingReport: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await feeService.getPendingReport();
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  },
};
