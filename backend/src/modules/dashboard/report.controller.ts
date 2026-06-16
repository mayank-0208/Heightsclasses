import { Response } from 'express';
import ExcelJS from 'exceljs';
import { Attendance } from '../attendance/attendance.model';
import { Result } from '../results/result.model';
import { Fee } from '../fees/fee.model';
import { User } from '../auth/user.model';
import { sendSuccess, AuthenticatedRequest } from '../../types';

const toCsv = (headers: string[], rows: (string | number)[][]): string => {
  const escape = (val: string | number) => {
    const str = String(val);
    return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n');
};

export const reportController = {
  attendanceReport: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { batchId, startDate, endDate, format = 'json' } = req.query;
    const filter: Record<string, unknown> = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) (filter.date as Record<string, Date>).$lte = new Date(endDate as string);
    }

    if (batchId) {
      const students = await User.find({ role: 'student', batch: batchId }).select('_id fullName studentId');
      filter.studentId = { $in: students.map((s) => s._id) };
    }

    const records = await Attendance.find(filter)
      .populate('studentId', 'fullName studentId')
      .sort({ date: -1 })
      .exec();

    if (format === 'csv') {
      const headers = ['Student Name', 'Student ID', 'Date', 'Status', 'Entry Time', 'Exit Time', 'Remarks'];
      const rows = records.map((r) => {
        const student = r.studentId as unknown as { fullName: string; studentId: string };
        return [
          student?.fullName || '',
          student?.studentId || '',
          r.date.toISOString().split('T')[0],
          r.status,
          r.entryTime || '',
          r.exitTime || '',
          r.remarks || '',
        ];
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
      res.send(toCsv(headers, rows));
      return;
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Attendance');
      sheet.columns = [
        { header: 'Student Name', key: 'name', width: 25 },
        { header: 'Student ID', key: 'studentId', width: 15 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Entry Time', key: 'entryTime', width: 12 },
        { header: 'Exit Time', key: 'exitTime', width: 12 },
        { header: 'Remarks', key: 'remarks', width: 30 },
      ];

      for (const r of records) {
        const student = r.studentId as unknown as { fullName: string; studentId: string };
        sheet.addRow({
          name: student?.fullName || '',
          studentId: student?.studentId || '',
          date: r.date.toISOString().split('T')[0],
          status: r.status,
          entryTime: r.entryTime || '',
          exitTime: r.exitTime || '',
          remarks: r.remarks || '',
        });
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.xlsx');
      await workbook.xlsx.write(res);
      return;
    }

    sendSuccess(res, records);
  },

  resultReport: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { testId, format = 'json' } = req.query;
    const filter: Record<string, unknown> = {};
    if (testId) filter.testId = testId;

    const records = await Result.find(filter)
      .populate('studentId', 'fullName studentId')
      .populate('testId', 'testName subject totalMarks testDate')
      .sort({ rank: 1 })
      .exec();

    if (format === 'csv') {
      const headers = ['Rank', 'Student Name', 'Student ID', 'Test', 'Subject', 'Obtained Marks', 'Percentage'];
      const rows = records.map((r) => {
        const student = r.studentId as unknown as { fullName: string; studentId: string };
        const test = r.testId as unknown as { testName: string; subject: string };
        return [r.rank, student?.fullName || '', student?.studentId || '', test?.testName || '', test?.subject || '', r.obtainedMarks, r.percentage];
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=result-report.csv');
      res.send(toCsv(headers, rows));
      return;
    }

    sendSuccess(res, records);
  },

  feeReport: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { format = 'json', defaultersOnly } = req.query;
    const filter: Record<string, unknown> = {};
    if (defaultersOnly === 'true') {
      filter.pendingFee = { $gt: 0 };
      filter.dueDate = { $lt: new Date() };
    }

    const records = await Fee.find(filter)
      .populate('studentId', 'fullName studentId email')
      .sort({ pendingFee: -1 })
      .exec();

    if (format === 'csv') {
      const headers = ['Student Name', 'Student ID', 'Total Fee', 'Paid Fee', 'Pending Fee', 'Due Date'];
      const rows = records.map((r) => {
        const student = r.studentId as unknown as { fullName: string; studentId: string };
        return [student?.fullName || '', student?.studentId || '', r.totalFee, r.paidFee, r.pendingFee, r.dueDate.toISOString().split('T')[0]];
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fee-report.csv');
      res.send(toCsv(headers, rows));
      return;
    }

    sendSuccess(res, records);
  },
};
