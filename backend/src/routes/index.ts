import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import studentRoutes from '../modules/students/student.routes';
import batchRoutes from '../modules/batches/batch.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import testRoutes from '../modules/tests/test.routes';
import resultRoutes from '../modules/results/result.routes';
import noteRoutes from '../modules/notes/note.routes';
import feeRoutes from '../modules/fees/fee.routes';
import announcementRoutes from '../modules/announcements/announcement.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import { reportController } from '../modules/dashboard/report.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditService } from '../modules/audit/audit.service';
import { sendSuccess, AuthenticatedRequest } from '../types';
import { Response, NextFunction } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/batches', batchRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/tests', testRoutes);
router.use('/results', resultRoutes);
router.use('/notes', noteRoutes);
router.use('/fees', feeRoutes);
router.use('/announcements', announcementRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/reports/attendance', authenticate, authorize('admin', 'teacher'), reportController.attendanceReport);
router.get('/reports/results', authenticate, authorize('admin', 'teacher'), reportController.resultReport);
router.get('/reports/fees', authenticate, authorize('admin'), reportController.feeReport);

router.get(
  '/audit-logs',
  authenticate,
  authorize('admin'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const logs = await auditService.getLogs(page, limit);
      sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
