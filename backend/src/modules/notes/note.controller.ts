import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { noteService } from './note.service';
import { ValidationError } from '../../utils/errors';
import { asString } from '../../utils/helpers';

export const noteController = {
  upload: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) throw new ValidationError('File is required');
      const note = await noteService.upload(req.body, req.file, req.user!.userId);
      sendSuccess(res, note, 201);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batchId = req.query.batchId as string | undefined;
      const subject = req.query.subject as string | undefined;
      const result = await noteService.getAll(req.query, batchId, subject);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const note = await noteService.getById(asString(req.params.id));
      sendSuccess(res, note);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const note = await noteService.delete(asString(req.params.id));
      sendSuccess(res, note);
    } catch (error) {
      next(error);
    }
  },
};
