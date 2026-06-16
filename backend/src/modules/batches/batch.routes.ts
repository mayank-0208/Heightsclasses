import { Router } from 'express';
import { batchController } from './batch.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import { createBatchSchema, updateBatchSchema, batchIdParamSchema } from './batch.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin'), validate(createBatchSchema), auditLog('CREATE_BATCH'), batchController.create);
router.get('/', authorize('admin', 'teacher', 'student'), batchController.getAll);
router.get('/my-batches', authorize('teacher'), batchController.getMyBatches);
router.get('/:id', authorize('admin', 'teacher', 'student'), validate(batchIdParamSchema), batchController.getById);
router.patch('/:id', authorize('admin'), validate(updateBatchSchema), auditLog('UPDATE_BATCH'), batchController.update);

export default router;
