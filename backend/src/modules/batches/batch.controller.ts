import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { batchService } from './batch.service';
import { asString } from '../../utils/helpers';

export const batchController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batch = await batchService.create(req.body);
      sendSuccess(res, batch, 201);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const result = await batchService.getAll(req.query, isActive);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batch = await batchService.getById(asString(req.params.id));
      sendSuccess(res, batch);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batch = await batchService.update(asString(req.params.id), req.body);
      sendSuccess(res, batch);
    } catch (error) {
      next(error);
    }
  },

  getMyBatches: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batches = await batchService.getByTeacher(req.user!.userId);
      sendSuccess(res, batches);
    } catch (error) {
      next(error);
    }
  },
};
