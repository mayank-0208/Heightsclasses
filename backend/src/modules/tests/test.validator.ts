import { z } from 'zod';

export const createTestSchema = z.object({
  body: z.object({
    testName: z.string().min(2),
    subject: z.string().min(2),
    totalMarks: z.number().min(1),
    batchId: z.string().min(1),
    testDate: z.string().or(z.date()),
  }),
});

export const updateTestSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    testName: z.string().min(2).optional(),
    subject: z.string().min(2).optional(),
    totalMarks: z.number().min(1).optional(),
    testDate: z.string().or(z.date()).optional(),
  }),
});

export const testIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
