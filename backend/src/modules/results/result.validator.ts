import { z } from 'zod';

export const createResultSchema = z.object({
  body: z.object({
    studentId: z.string().min(1),
    testId: z.string().min(1),
    obtainedMarks: z.number().min(0),
  }),
});

export const bulkResultSchema = z.object({
  body: z.object({
    testId: z.string().min(1),
    results: z.array(
      z.object({
        studentId: z.string().min(1),
        obtainedMarks: z.number().min(0),
      })
    ).min(1),
  }),
});

export const updateResultSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    obtainedMarks: z.number().min(0),
  }),
});

export const resultIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
