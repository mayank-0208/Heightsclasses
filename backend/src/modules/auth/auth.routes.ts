import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from './auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', validate(resetPasswordRequestSchema), authController.requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.use(authenticate);

router.post('/logout', auditLog('LOGOUT'), authController.logout);
router.get('/profile', authController.getProfile);
router.post('/change-password', validate(changePasswordSchema), auditLog('CHANGE_PASSWORD'), authController.changePassword);

router.post(
  '/users',
  authorize('admin'),
  validate(createUserSchema),
  auditLog('CREATE_USER'),
  authController.createUser
);

router.get('/users', authorize('admin'), authController.getUsers);

router.patch(
  '/users/:id',
  authorize('admin'),
  validate(updateUserSchema),
  auditLog('UPDATE_USER'),
  authController.updateUser
);

router.delete(
  '/users/:id',
  authorize('admin'),
  validate(userIdParamSchema),
  auditLog('DEACTIVATE_USER'),
  authController.deactivateUser
);

export default router;
