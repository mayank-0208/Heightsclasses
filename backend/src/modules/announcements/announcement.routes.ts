import { Router } from 'express';
import { announcementController } from './announcement.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import { createAnnouncementSchema, announcementIdParamSchema } from './announcement.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('admin'),
  validate(createAnnouncementSchema),
  auditLog('CREATE_ANNOUNCEMENT'),
  announcementController.create
);

router.get('/', authorize('admin', 'teacher', 'student'), announcementController.getAll);
router.get('/:id', authorize('admin', 'teacher', 'student'), validate(announcementIdParamSchema), announcementController.getById);
router.post('/:id/read', authorize('student'), validate(announcementIdParamSchema), announcementController.markAsRead);
router.delete('/:id', authorize('admin'), validate(announcementIdParamSchema), auditLog('DELETE_ANNOUNCEMENT'), announcementController.delete);

export default router;
