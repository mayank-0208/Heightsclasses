import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { announcementService } from './announcement.service';
import { asString } from '../../utils/helpers';

export const announcementController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcement = await announcementService.create({
        ...req.body,
        createdBy: req.user!.userId,
      });
      sendSuccess(res, announcement, 201);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user!.role === 'student') {
        const result = await announcementService.getForStudent(req.user!.userId, req.query);
        sendSuccess(res, result);
        return;
      }
      const targetBatch = req.query.targetBatch as string | undefined;
      const result = await announcementService.getAll(req.query, targetBatch);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcement = await announcementService.getById(asString(req.params.id));
      sendSuccess(res, announcement);
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcement = await announcementService.markAsRead(asString(req.params.id), req.user!.userId);
      sendSuccess(res, announcement);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcement = await announcementService.delete(asString(req.params.id));
      sendSuccess(res, announcement);
    } catch (error) {
      next(error);
    }
  },
};
