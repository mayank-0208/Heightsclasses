import { Router } from 'express';
import { studentController } from './student.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import { createStudentSchema, updateStudentSchema, studentIdParamSchema } from './student.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('admin'),
  validate(createStudentSchema),
  auditLog('CREATE_STUDENT'),
  studentController.create
);

router.get('/', authorize('admin', 'teacher'), studentController.getAll);
router.get('/batch/:batchId', authorize('admin', 'teacher'), studentController.getByBatch);
router.get('/:id', authorize('admin', 'teacher', 'student'), validate(studentIdParamSchema), studentController.getById);

router.patch(
  '/:id',
  authorize('admin'),
  validate(updateStudentSchema),
  auditLog('UPDATE_STUDENT'),
  studentController.update
);

export default router;
