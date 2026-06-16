import { Router } from 'express';
import { feeController } from './fee.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import { createFeeSchema, recordPaymentSchema, feeIdParamSchema } from './fee.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin'), validate(createFeeSchema), auditLog('CREATE_FEE'), feeController.create);
router.get('/', authorize('admin'), feeController.getAll);
router.get('/defaulters', authorize('admin'), feeController.getDefaulters);
router.get('/pending-report', authorize('admin'), feeController.getPendingReport);
router.get('/student/:studentId', authorize('admin', 'student'), feeController.getByStudent);
router.post(
  '/:id/payment',
  authorize('admin'),
  validate(recordPaymentSchema),
  auditLog('RECORD_PAYMENT'),
  feeController.recordPayment
);

export default router;
