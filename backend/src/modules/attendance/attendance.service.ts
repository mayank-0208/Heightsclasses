import { Attendance } from './attendance.model';
import { attendanceRepository } from './attendance.repository';
import { User } from '../auth/user.model';
import { getPaginationParams } from '../../utils/pagination';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { AttendanceStatus } from '../../types';

const normalizeDate = (date: string | Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const attendanceService = {
  mark: async (data: {
    studentId: string;
    date: string | Date;
    status: AttendanceStatus;
    entryTime?: string;
    exitTime?: string;
    remarks?: string;
    markedBy: string;
  }) => {
    const student = await User.findOne({ _id: data.studentId, role: 'student' });
    if (!student) throw new NotFoundError('Student');

    const date = normalizeDate(data.date);
    const existing = await attendanceRepository.findByStudentAndDate(data.studentId, date);
    if (existing) throw new ConflictError('Attendance already marked for this date');

    return attendanceRepository.create({
      studentId: data.studentId as never,
      date,
      status: data.status,
      entryTime: data.entryTime,
      exitTime: data.exitTime,
      remarks: data.remarks,
      markedBy: data.markedBy as never,
    });
  },

  markBulk: async (
    date: string | Date,
    records: Array<{
      studentId: string;
      status: AttendanceStatus;
      entryTime?: string;
      exitTime?: string;
      remarks?: string;
    }>,
    markedBy: string
  ) => {
    const normalizedDate = normalizeDate(date);
    const results = [];

    for (const record of records) {
      const existing = await attendanceRepository.findByStudentAndDate(record.studentId, normalizedDate);
      if (existing) {
        const updated = await attendanceRepository.update(existing._id.toString(), {
          status: record.status,
          entryTime: record.entryTime,
          exitTime: record.exitTime,
          remarks: record.remarks,
          markedBy: markedBy as never,
        });
        results.push(updated);
      } else {
        const created = await attendanceRepository.create({
          studentId: record.studentId as never,
          date: normalizedDate,
          status: record.status,
          entryTime: record.entryTime,
          exitTime: record.exitTime,
          remarks: record.remarks,
          markedBy: markedBy as never,
        });
        results.push(created);
      }
    }

    return results;
  },

  update: async (id: string, data: Partial<IAttendanceUpdate>) => {
    const attendance = await attendanceRepository.update(id, data as never);
    if (!attendance) throw new NotFoundError('Attendance');
    return attendance;
  },

  getByStudent: async (studentId: string, startDate?: string, endDate?: string) => {
    const filter: Record<string, unknown> = { studentId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, Date>).$gte = normalizeDate(startDate);
      if (endDate) (filter.date as Record<string, Date>).$lte = normalizeDate(endDate);
    }
    return attendanceRepository.findByFilter(filter);
  },

  getReport: async (query: {
    studentId?: string;
    batchId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const filter: Record<string, unknown> = {};
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) (filter.date as Record<string, Date>).$gte = normalizeDate(query.startDate);
      if (query.endDate) (filter.date as Record<string, Date>).$lte = normalizeDate(query.endDate);
    }

    if (query.studentId) {
      filter.studentId = query.studentId;
    } else if (query.batchId) {
      const students = await User.find({ role: 'student', batch: query.batchId }).select('_id');
      filter.studentId = { $in: students.map((s) => s._id) };
    }

    const { page, limit, skip } = getPaginationParams(query);
    const [items, total] = await Promise.all([
      Attendance.find(filter)
        .populate('studentId', 'fullName studentId batch')
        .populate('markedBy', 'fullName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Attendance.countDocuments(filter),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  getAnalytics: async (studentId?: string, batchId?: string) => {
    const filter: Record<string, unknown> = {};
    if (studentId) {
      filter.studentId = studentId;
    } else if (batchId) {
      const students = await User.find({ role: 'student', batch: batchId }).select('_id');
      filter.studentId = { $in: students.map((s) => s._id) };
    }

    const records = await Attendance.find(filter).exec();
    const presentCount = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const halfDayCount = records.filter((r) => r.status === 'Half-Day').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((presentCount / total) * 10000) / 100 : 0;

    const monthlyTrend: Record<string, { present: number; absent: number }> = {};
    for (const record of records) {
      const monthKey = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyTrend[monthKey]) monthlyTrend[monthKey] = { present: 0, absent: 0 };
      if (record.status === 'Present' || record.status === 'Late') {
        monthlyTrend[monthKey].present++;
      } else {
        monthlyTrend[monthKey].absent++;
      }
    }

    return { presentCount, absentCount, halfDayCount, total, percentage, monthlyTrend };
  },

  getTodayStats: async () => {
    const today = normalizeDate(new Date());
    const records = await Attendance.find({ date: today }).exec();
    return {
      present: records.filter((r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Half-Day').length,
      absent: records.filter((r) => r.status === 'Absent').length,
      total: records.length,
    };
  },
};

interface IAttendanceUpdate {
  status?: AttendanceStatus;
  entryTime?: string;
  exitTime?: string;
  remarks?: string;
}
