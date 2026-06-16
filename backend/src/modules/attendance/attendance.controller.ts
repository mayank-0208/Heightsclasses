import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { attendanceService } from './attendance.service';
import { ForbiddenError } from '../../utils/errors';
import { asString } from '../../utils/helpers';

export const attendanceController = {
  mark: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await attendanceService.mark({ ...req.body, markedBy: req.user!.userId });
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  markBulk: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await attendanceService.markBulk(req.body.date, req.body.records, req.user!.userId);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await attendanceService.update(asString(req.params.id), req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByStudent: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = asString(req.params.studentId);
      if (req.user!.role === 'student' && req.user!.userId !== studentId) {
        throw new ForbiddenError('Cannot access other student attendance');
      }
      const result = await attendanceService.getByStudent(
        studentId,
        req.query.startDate as string,
        req.query.endDate as string
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getReport: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await attendanceService.getReport(req.query as never);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.role === 'student' ? req.user!.userId : (req.query.studentId as string);
      const batchId = req.query.batchId as string;
      const result = await attendanceService.getAnalytics(studentId, batchId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
