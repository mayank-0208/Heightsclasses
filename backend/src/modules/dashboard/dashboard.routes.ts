import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize('admin'), dashboardController.getAdmin);
router.get('/teacher', authorize('teacher'), dashboardController.getTeacher);
router.get('/student', authorize('student'), dashboardController.getStudent);

export default router;
