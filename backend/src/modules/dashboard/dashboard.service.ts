import { User } from '../auth/user.model';
import { authRepository } from '../auth/auth.repository';
import { batchRepository } from '../batches/batch.repository';
import { testRepository } from '../tests/test.repository';
import { feeRepository } from '../fees/fee.repository';
import { attendanceService } from '../attendance/attendance.service';
import { resultService } from '../results/result.service';
import { noteRepository } from '../notes/note.repository';
import { Test } from '../tests/test.model';
import { Fee } from '../fees/fee.model';

export const dashboardService = {
  getAdminDashboard: async () => {
    const [totalStudents, totalTeachers, todayAttendance, pendingFees, totalTests] = await Promise.all([
      authRepository.countByRole('student'),
      authRepository.countByRole('teacher'),
      attendanceService.getTodayStats(),
      feeRepository.getPendingTotal(),
      testRepository.countAll(),
    ]);

    const attendanceAnalytics = await attendanceService.getAnalytics();
    const feeAnalytics = await feeServiceAnalytics();
    const resultAnalytics = await resultServiceAnalytics();

    return {
      cards: {
        totalStudents,
        totalTeachers,
        presentToday: todayAttendance.present,
        absentToday: todayAttendance.absent,
        pendingFees,
        totalTests,
      },
      charts: {
        attendanceAnalytics,
        feeAnalytics,
        resultAnalytics,
      },
    };
  },

  getTeacherDashboard: async (teacherId: string) => {
    const [assignedBatches, todayAttendance, recentTests, uploadedNotes] = await Promise.all([
      batchRepository.findByTeacher(teacherId),
      attendanceService.getTodayStats(),
      Test.find().sort({ testDate: -1 }).limit(5).populate('batchId', 'batchName').exec(),
      noteRepository.countRecent(teacherId),
    ]);

    return {
      cards: {
        assignedBatches: assignedBatches.length,
        todayPresent: todayAttendance.present,
        todayAbsent: todayAttendance.absent,
        recentTestsCount: recentTests.length,
        uploadedNotes,
      },
      assignedBatches,
      recentTests,
    };
  },

  getStudentDashboard: async (studentId: string) => {
    const [attendanceAnalytics, rankSummary, fee] = await Promise.all([
      attendanceService.getAnalytics(studentId),
      resultService.getStudentRankSummary(studentId),
      Fee.findOne({ studentId }).exec(),
    ]);

    return {
      cards: {
        attendancePercentage: attendanceAnalytics.percentage,
        latestMarks: rankSummary.latestMarks,
        currentRank: rankSummary.latestRank,
        pendingFees: fee?.pendingFee || 0,
      },
      attendanceAnalytics,
      rankSummary,
      fee,
    };
  },
};

const feeServiceAnalytics = async () => {
  const fees = await Fee.find().exec();
  const totalCollected = fees.reduce((sum, f) => sum + f.paidFee, 0);
  const totalPending = fees.reduce((sum, f) => sum + f.pendingFee, 0);
  const defaulters = fees.filter((f) => f.pendingFee > 0 && f.dueDate < new Date()).length;

  return { totalCollected, totalPending, defaulters, totalStudents: fees.length };
};

const resultServiceAnalytics = async () => {
  const tests = await Test.find().sort({ testDate: -1 }).limit(10).exec();
  const analytics = [];

  for (const test of tests) {
    const data = await resultService.getByTest(test._id.toString());
    analytics.push({
      testName: test.testName,
      subject: test.subject,
      testDate: test.testDate,
      ...data.stats,
    });
  }

  return analytics;
};
