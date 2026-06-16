import { Router } from 'express';
import { resultController } from './result.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import {
  createResultSchema,
  bulkResultSchema,
  updateResultSchema,
  resultIdParamSchema,
} from './result.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin', 'teacher'), validate(createResultSchema), auditLog('CREATE_RESULT'), resultController.create);
router.post('/bulk', authorize('admin', 'teacher'), validate(bulkResultSchema), auditLog('BULK_RESULTS'), resultController.createBulk);
router.patch('/:id', authorize('admin', 'teacher'), validate(updateResultSchema), auditLog('UPDATE_RESULT'), resultController.update);
router.get('/test/:testId', authorize('admin', 'teacher', 'student'), resultController.getByTest);
router.get('/student/:studentId', authorize('admin', 'teacher', 'student'), resultController.getByStudent);
router.get('/rank/:studentId?', authorize('admin', 'teacher', 'student'), resultController.getRankSummary);

export default router;
