import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(8),
    batch: z.string().min(1, 'Batch is required'),
    fatherName: z.string().min(2),
    motherName: z.string().min(2),
    address: z.string().min(5),
    joiningDate: z.string().or(z.date()),
    dateOfBirth: z.string().or(z.date()),
    emergencyContact: z.string().min(10),
    totalFee: z.number().min(0).optional(),
    dueDate: z.string().or(z.date()).optional(),
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    batch: z.string().optional(),
    fatherName: z.string().min(2).optional(),
    motherName: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    emergencyContact: z.string().min(10).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const studentIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
