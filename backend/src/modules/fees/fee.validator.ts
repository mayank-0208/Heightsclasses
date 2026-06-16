import { z } from 'zod';

export const createFeeSchema = z.object({
  body: z.object({
    studentId: z.string().min(1),
    totalFee: z.number().min(0),
    dueDate: z.string().or(z.date()),
  }),
});

export const recordPaymentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    amount: z.number().min(0.01),
    paymentDate: z.string().or(z.date()),
    paymentMethod: z.string().min(2),
    transactionId: z.string().optional(),
    remarks: z.string().optional(),
  }),
});

export const feeIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
