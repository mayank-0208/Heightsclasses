import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { resultService } from './result.service';
import { ForbiddenError } from '../../utils/errors';
import { asString } from '../../utils/helpers';

export const resultController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await resultService.create(req.body);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  createBulk: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await resultService.createBulk(req.body.testId, req.body.results);
      sendSuccess(res, results, 201);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await resultService.update(asString(req.params.id), req.body.obtainedMarks);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByTest: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await resultService.getByTest(asString(req.params.testId));
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  getByStudent: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = asString(req.params.studentId);
      if (req.user!.role === 'student' && req.user!.userId !== studentId) {
        throw new ForbiddenError('Cannot access other student results');
      }
      const results = await resultService.getByStudent(studentId);
      sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  },

  getRankSummary: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.role === 'student' ? req.user!.userId : asString(req.params.studentId);
      const summary = await resultService.getStudentRankSummary(studentId);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  },
};
