import { Attendance, IAttendance } from './attendance.model';

export const attendanceRepository = {
  create: (data: Partial<IAttendance>): Promise<IAttendance> => Attendance.create(data),

  findById: (id: string): Promise<IAttendance | null> =>
    Attendance.findById(id).populate('studentId', 'fullName studentId').populate('markedBy', 'fullName').exec(),

  update: (id: string, data: Partial<IAttendance>): Promise<IAttendance | null> =>
    Attendance.findByIdAndUpdate(id, data, { new: true })
      .populate('studentId', 'fullName studentId')
      .populate('markedBy', 'fullName')
      .exec(),

  findByStudentAndDate: (studentId: string, date: Date): Promise<IAttendance | null> =>
    Attendance.findOne({ studentId, date }).exec(),

  findByFilter: (filter: Record<string, unknown>) =>
    Attendance.find(filter)
      .populate('studentId', 'fullName studentId batch')
      .populate('markedBy', 'fullName')
      .sort({ date: -1 })
      .exec(),

  countByStatus: async (filter: Record<string, unknown>, status: string): Promise<number> =>
    Attendance.countDocuments({ ...filter, status }).exec(),
};
