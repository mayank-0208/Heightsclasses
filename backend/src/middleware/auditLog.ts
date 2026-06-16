import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { auditService } from '../modules/audit/audit.service';
import { asString } from '../utils/helpers';

export const auditLog = (action: string, resource?: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      if (req.user && res.statusCode < 400) {
        auditService
          .create({
            userId: req.user.userId,
            action: resource ? `${action} - ${resource}` : action,
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
            resourceId: asString(req.params.id) || undefined,
          })
          .catch(() => {});
      }
      return originalJson(body);
    };

    next();
  };
};
