import { AuditLog } from './audit.model';

export const auditService = {
  create: async (data: {
    userId: string;
    action: string;
    ipAddress: string;
    resourceId?: string;
  }) => {
    return AuditLog.create({
      userId: data.userId,
      action: data.resourceId ? `${data.action} (${data.resourceId})` : data.action,
      ipAddress: data.ipAddress,
      resourceId: data.resourceId,
    });
  },

  getLogs: async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      AuditLog.find()
        .populate('userId', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      AuditLog.countDocuments(),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },
};
