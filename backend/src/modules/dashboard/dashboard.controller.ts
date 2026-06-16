import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  getAdmin: async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await dashboardService.getAdminDashboard();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  getTeacher: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await dashboardService.getTeacherDashboard(req.user!.userId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  getStudent: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await dashboardService.getStudentDashboard(req.user!.userId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
