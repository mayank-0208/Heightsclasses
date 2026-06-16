import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { studentService } from './student.service';
import { ForbiddenError } from '../../utils/errors';
import { asString } from '../../utils/helpers';

export const studentController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await studentService.create(req.body);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batchId = req.query.batchId as string | undefined;
      const result = await studentService.getAll(req.query, batchId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user!.role === 'student' && req.user!.userId !== asString(req.params.id)) {
        throw new ForbiddenError('Cannot access other student data');
      }
      const result = await studentService.getById(asString(req.params.id));
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fullName, email, phone, batch, isActive, ...profileData } = req.body;
      const userData = { fullName, email, phone, batch, isActive };
      const result = await studentService.update(asString(req.params.id), userData, profileData);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByBatch: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await studentService.getByBatch(asString(req.params.batchId));
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
