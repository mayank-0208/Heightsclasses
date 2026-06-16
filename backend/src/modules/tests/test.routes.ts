import { Router } from 'express';
import { testController } from './test.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import { createTestSchema, updateTestSchema, testIdParamSchema } from './test.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin', 'teacher'), validate(createTestSchema), auditLog('CREATE_TEST'), testController.create);
router.get('/', authorize('admin', 'teacher', 'student'), testController.getAll);
router.get('/:id', authorize('admin', 'teacher', 'student'), validate(testIdParamSchema), testController.getById);
router.patch('/:id', authorize('admin', 'teacher'), validate(updateTestSchema), auditLog('UPDATE_TEST'), testController.update);
router.delete('/:id', authorize('admin'), validate(testIdParamSchema), auditLog('DELETE_TEST'), testController.delete);

export default router;
