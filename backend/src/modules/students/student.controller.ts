import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { studentService } from './student.service';
import { ForbiddenError } from '../../utils/errors';
import { asString } from '../../utils/helpers';
import { Batch } from '../batches/batch.model';

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
      const result = await studentService.getAll(req.query, batchId, req.user!.role, req.user!.userId);
      
      if (req.user!.role === 'teacher') {
        result.items = result.items.map((item: any) => {
          const doc = item.toObject ? item.toObject() : item;
          delete doc.phone;
          delete doc.password;
          return doc;
        });
      }
      
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
      
      if (req.user!.role === 'teacher') {
        const studentBatchId = result.user.batch?._id || result.user.batch;
        if (studentBatchId) {
          const isAssigned = await Batch.exists({
            _id: studentBatchId,
            assignedTeacher: req.user!.userId
          });
          if (!isAssigned) {
            throw new ForbiddenError('Cannot access students outside your batches');
          }
        } else {
          throw new ForbiddenError('Cannot access students without a batch');
        }
        
        const doc = result.user.toObject ? result.user.toObject() : result.user;
        delete doc.phone;
        delete doc.password;
        result.user = doc;
      }
      
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
      if (req.user!.role === 'teacher') {
        const isAssigned = await Batch.exists({
          _id: asString(req.params.batchId),
          assignedTeacher: req.user!.userId
        });
        if (!isAssigned) {
          throw new ForbiddenError('Cannot access batches outside your assignment');
        }
      }
      
      const result = await studentService.getByBatch(asString(req.params.batchId));
      
      if (req.user!.role === 'teacher') {
        const stripped = result.map((item: any) => {
          const doc = item.toObject ? item.toObject() : item;
          delete doc.phone;
          delete doc.password;
          return doc;
        });
        sendSuccess(res, stripped);
        return;
      }
      
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
