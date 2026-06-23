import { authRepository } from './auth.repository';
import { IUser } from './user.model';
import { User } from './user.model';
import { env } from '../../config/env';
import { generateResetToken, hashToken } from '../../utils/helpers';
import { paginate } from '../../utils/pagination';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../../utils/errors';
import { PaginationQuery } from '../../types';
import { logger } from '../../utils/logger';

interface LoginResult {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  fullName: user.fullName,
  studentId: user.studentId,
  email: user.email,
  phone: user.phone,
  role: user.role,
  batch: user.batch,
  isActive: user.isActive,
  mustChangePassword: user.mustChangePassword,
  createdAt: user.createdAt,
});

export const authService = {
  login: async (identifier: string, password: string): Promise<LoginResult> => {
    const user = await authRepository.findByIdentifier(identifier, true);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await authRepository.comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload = { userId: user._id.toString(), role: user.role, email: user.email };
    const accessToken = authRepository.generateAccessToken(payload);
    const refreshToken = authRepository.generateRefreshToken(payload);

    await authRepository.update(user._id.toString(), { refreshToken });

    logger.info('User logged in', { userId: user._id, role: user.role });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      mustChangePassword: user.mustChangePassword,
    };
  },

  refreshAccessToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const decoded = authRepository.verifyRefreshToken(refreshToken);
    const user = await authRepository.findByRefreshToken(refreshToken);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const payload = { userId: user._id.toString(), role: user.role, email: user.email };
    const newAccessToken = authRepository.generateAccessToken(payload);
    const newRefreshToken = authRepository.generateRefreshToken(payload);

    await authRepository.update(user._id.toString(), { refreshToken: newRefreshToken });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  logout: async (userId: string): Promise<void> => {
    await authRepository.update(userId, { refreshToken: undefined });
    logger.info('User logged out', { userId });
  },

  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    const user = await authRepository.findById(userId, true);
    if (!user) throw new NotFoundError('User');

    const isValid = await authRepository.comparePassword(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedError('Current password is incorrect');

    const hashed = await authRepository.hashPassword(newPassword);
    await authRepository.update(userId, {
      password: hashed,
      mustChangePassword: false,
    } as Partial<IUser>);

    logger.info('Password changed', { userId });
  },

  requestPasswordReset: async (email: string): Promise<{ message: string; resetToken?: string }> => {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    await authRepository.update(user._id.toString(), {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 3600000),
    } as Partial<IUser>);

    logger.info('Password reset requested', { userId: user._id });

    return {
      message: 'If the email exists, a reset link has been sent',
      resetToken: env.isProduction ? undefined : resetToken,
    };
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const hashedToken = hashToken(token);
    const user = await authRepository.findByResetToken(hashedToken);
    if (!user) throw new ValidationError('Invalid or expired reset token');

    const hashed = await authRepository.hashPassword(newPassword);
    await authRepository.update(user._id.toString(), {
      password: hashed,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      mustChangePassword: false,
    } as Partial<IUser>);

    logger.info('Password reset completed', { userId: user._id });
  },

  getProfile: async (userId: string) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return sanitizeUser(user);
  },

  createUser: async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'admin' | 'teacher' | 'student';
    batch?: string;
    mustChangePassword?: boolean;
  }) => {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already registered');

    const hashed = await authRepository.hashPassword(data.password);
    const user = await authRepository.create({
      ...data,
      password: hashed,
      mustChangePassword: data.mustChangePassword ?? true,
    } as Partial<IUser>);

    return sanitizeUser(user);
  },

  getUsers: async (query: PaginationQuery, role?: string) => {
    const filter = role ? { role } : {};
    return paginate(User, filter, query, ['fullName', 'email', 'studentId'], 'batch');
  },

  updateUser: async (id: string, data: Partial<IUser>) => {
    const user = await authRepository.update(id, data);
    if (!user) throw new NotFoundError('User');
    return sanitizeUser(user);
  },

  deactivateUser: async (id: string) => {
    const user = await authRepository.update(id, { isActive: false });
    if (!user) throw new NotFoundError('User');
    return sanitizeUser(user);
  },

  seedAdmin: async (): Promise<void> => {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;

    const existing = await authRepository.findByEmail(env.ADMIN_EMAIL);
    if (existing) return;

    const hashed = await authRepository.hashPassword(env.ADMIN_PASSWORD);
    await authRepository.create({
      fullName: env.ADMIN_FULL_NAME || 'System Administrator',
      email: env.ADMIN_EMAIL,
      phone: '0000000000',
      password: hashed,
      role: 'admin',
      mustChangePassword: false,
      isActive: true,
    } as Partial<IUser>);

    logger.info('Admin user seeded');
  },
};
