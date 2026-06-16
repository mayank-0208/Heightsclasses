import { z } from 'zod';

export const createBatchSchema = z.object({
  body: z.object({
    batchName: z.string().min(2),
    description: z.string().min(5),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    assignedTeacher: z.string().min(1),
  }),
});

export const updateBatchSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    batchName: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional(),
    assignedTeacher: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const batchIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
