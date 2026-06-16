import { z } from 'zod';

const attendanceStatus = z.enum(['Present', 'Absent', 'Late', 'Half-Day']);

export const markAttendanceSchema = z.object({
  body: z.object({
    studentId: z.string().min(1),
    date: z.string().or(z.date()),
    status: attendanceStatus,
    entryTime: z.string().optional(),
    exitTime: z.string().optional(),
    remarks: z.string().optional(),
  }),
});

export const bulkAttendanceSchema = z.object({
  body: z.object({
    date: z.string().or(z.date()),
    records: z.array(
      z.object({
        studentId: z.string().min(1),
        status: attendanceStatus,
        entryTime: z.string().optional(),
        exitTime: z.string().optional(),
        remarks: z.string().optional(),
      })
    ).min(1),
  }),
});

export const updateAttendanceSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: attendanceStatus.optional(),
    entryTime: z.string().optional(),
    exitTime: z.string().optional(),
    remarks: z.string().optional(),
  }),
});

export const attendanceReportSchema = z.object({
  query: z.object({
    studentId: z.string().optional(),
    batchId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
