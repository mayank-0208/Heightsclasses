import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    content: z.string().min(5),
    targetBatch: z.string().optional(),
  }),
});

export const announcementIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
