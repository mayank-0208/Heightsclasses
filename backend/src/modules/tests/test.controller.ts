import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { testService } from './test.service';
import { asString } from '../../utils/helpers';

export const testController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const test = await testService.create({ ...req.body, createdBy: req.user!.userId });
      sendSuccess(res, test, 201);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batchId = req.query.batchId as string | undefined;
      const result = await testService.getAll(req.query, batchId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const test = await testService.getById(asString(req.params.id));
      sendSuccess(res, test);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const test = await testService.update(asString(req.params.id), req.body);
      sendSuccess(res, test);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const test = await testService.delete(asString(req.params.id));
      sendSuccess(res, test);
    } catch (error) {
      next(error);
    }
  },
};
