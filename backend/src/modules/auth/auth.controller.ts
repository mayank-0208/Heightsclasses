import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, sendSuccess } from '../../types';
import { authService } from './auth.service';
import { asString } from '../../utils/helpers';

export const authController = {
  login: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.body.email || req.body.username || req.body.studentId;
      const result = await authService.login(identifier, req.body.password);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.refreshAccessToken(req.body.refreshToken);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.logout(req.user!.userId);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.changePassword(
        req.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
      );
      sendSuccess(res, { message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },

  requestPasswordReset: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      sendSuccess(res, { message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await authService.getProfile(req.user!.userId);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.createUser(req.body);
      sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  },

  getUsers: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = req.query.role as string | undefined;
      const result = await authService.getUsers(req.query, role);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.updateUser(asString(req.params.id), req.body);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },

  deactivateUser: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.deactivateUser(asString(req.params.id));
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },
};
