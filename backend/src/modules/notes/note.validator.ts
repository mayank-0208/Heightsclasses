import { z } from 'zod';

export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    subject: z.string().min(2),
    batchId: z.string().min(1),
  }),
});

export const noteIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
