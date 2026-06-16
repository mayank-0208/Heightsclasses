import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import {
  markAttendanceSchema,
  bulkAttendanceSchema,
  updateAttendanceSchema,
  attendanceReportSchema,
} from './attendance.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'teacher'),
  validate(markAttendanceSchema),
  auditLog('MARK_ATTENDANCE'),
  attendanceController.mark
);

router.post(
  '/bulk',
  authorize('admin', 'teacher'),
  validate(bulkAttendanceSchema),
  auditLog('BULK_ATTENDANCE'),
  attendanceController.markBulk
);

router.patch(
  '/:id',
  authorize('admin', 'teacher'),
  validate(updateAttendanceSchema),
  auditLog('UPDATE_ATTENDANCE'),
  attendanceController.update
);

router.get('/student/:studentId', authorize('admin', 'teacher', 'student'), attendanceController.getByStudent);
router.get('/report', authorize('admin', 'teacher'), validate(attendanceReportSchema), attendanceController.getReport);
router.get('/analytics', authorize('admin', 'teacher', 'student'), attendanceController.getAnalytics);

export default router;
