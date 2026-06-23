import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser, User } from './user.model';
import { env } from '../../config/env';
import { JwtPayload } from '../../types';

const SALT_ROUNDS = 12;

export const authRepository = {
  findByEmail: (email: string, includePassword = false): Promise<IUser | null> => {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password +refreshToken +resetPasswordToken +resetPasswordExpires');
    }
    return query.exec();
  },

  findByIdentifier: (identifier: string, includePassword = false): Promise<IUser | null> => {
    const query = User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { studentId: identifier.toUpperCase() }
      ]
    });
    if (includePassword) {
      query.select('+password +refreshToken +resetPasswordToken +resetPasswordExpires');
    }
    return query.exec();
  },

  findById: (id: string, includeSecrets = false): Promise<IUser | null> => {
    const query = User.findById(id);
    if (includeSecrets) {
      query.select('+password +refreshToken +resetPasswordToken +resetPasswordExpires');
    }
    return query.exec();
  },

  findByResetToken: (hashedToken: string): Promise<IUser | null> => {
    return User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    })
      .select('+password +resetPasswordToken +resetPasswordExpires')
      .exec();
  },

  findByRefreshToken: (refreshToken: string): Promise<IUser | null> => {
    return User.findOne({ refreshToken }).select('+refreshToken').exec();
  },

  create: (data: Partial<IUser>): Promise<IUser> => {
    return User.create(data);
  },

  update: (id: string, data: Partial<IUser>): Promise<IUser | null> => {
    return User.findByIdAndUpdate(id, data, { new: true }).exec();
  },

  countByRole: (role: string): Promise<number> => {
    return User.countDocuments({ role, isActive: true }).exec();
  },

  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  comparePassword: async (plain: string, hashed: string): Promise<boolean> => {
    return bcrypt.compare(plain, hashed);
  },

  generateAccessToken: (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  },

  generateRefreshToken: (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  },

  verifyRefreshToken: (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  },
};
