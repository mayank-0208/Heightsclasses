import { resultRepository } from './result.repository';
import { testRepository } from '../tests/test.repository';
import { User } from '../auth/user.model';
import { calculateRank, calculatePercentage } from '../../utils/pagination';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors';

const recalculateRanks = async (testId: string, totalMarks: number) => {
  const allResults = await resultRepository.findByTest(testId);
  const rankInput = allResults.map((r) => ({
    studentId: r.studentId._id ? r.studentId._id.toString() : r.studentId.toString(),
    obtainedMarks: r.obtainedMarks,
  }));

  const rankMap = calculateRank(rankInput);

  for (const result of allResults) {
    const studentId = result.studentId._id ? result.studentId._id.toString() : result.studentId.toString();
    const rank = rankMap.get(studentId) || 1;
    const percentage = calculatePercentage(result.obtainedMarks, totalMarks);
    await resultRepository.update(result._id.toString(), { rank, percentage });
  }

  return resultRepository.findByTest(testId);
};

export const resultService = {
  create: async (data: { studentId: string; testId: string; obtainedMarks: number }) => {
    const test = await testRepository.findById(data.testId);
    if (!test) throw new NotFoundError('Test');

    const student = await User.findOne({ _id: data.studentId, role: 'student' });
    if (!student) throw new NotFoundError('Student');

    if (data.obtainedMarks > test.totalMarks) {
      throw new ValidationError('Obtained marks cannot exceed total marks');
    }

    const existing = await resultRepository.findByStudentAndTest(data.studentId, data.testId);
    if (existing) throw new ConflictError('Result already exists for this student and test');

    const percentage = calculatePercentage(data.obtainedMarks, test.totalMarks);

    await resultRepository.create({
      studentId: data.studentId as never,
      testId: data.testId as never,
      obtainedMarks: data.obtainedMarks,
      percentage,
      rank: 1,
    });

    const results = await recalculateRanks(data.testId, test.totalMarks);
    return results.find((r) => {
      const sid = r.studentId._id ? r.studentId._id.toString() : r.studentId.toString();
      return sid === data.studentId;
    });
  },

  createBulk: async (testId: string, results: Array<{ studentId: string; obtainedMarks: number }>) => {
    const test = await testRepository.findById(testId);
    if (!test) throw new NotFoundError('Test');

    for (const item of results) {
      if (item.obtainedMarks > test.totalMarks) {
        throw new ValidationError(`Obtained marks cannot exceed total marks for student ${item.studentId}`);
      }

      const existing = await resultRepository.findByStudentAndTest(item.studentId, testId);
      const percentage = calculatePercentage(item.obtainedMarks, test.totalMarks);

      if (existing) {
        await resultRepository.update(existing._id.toString(), {
          obtainedMarks: item.obtainedMarks,
          percentage,
        });
      } else {
        await resultRepository.create({
          studentId: item.studentId as never,
          testId: testId as never,
          obtainedMarks: item.obtainedMarks,
          percentage,
          rank: 1,
        });
      }
    }

    return recalculateRanks(testId, test.totalMarks);
  },

  update: async (id: string, obtainedMarks: number) => {
    const result = await resultRepository.findById(id);
    if (!result) throw new NotFoundError('Result');

    const test = await testRepository.findById(result.testId._id ? result.testId._id.toString() : result.testId.toString());
    if (!test) throw new NotFoundError('Test');

    if (obtainedMarks > test.totalMarks) {
      throw new ValidationError('Obtained marks cannot exceed total marks');
    }

    const percentage = calculatePercentage(obtainedMarks, test.totalMarks);
    await resultRepository.update(id, { obtainedMarks, percentage });

    const testId = result.testId._id ? result.testId._id.toString() : result.testId.toString();
    const results = await recalculateRanks(testId, test.totalMarks);
    return results.find((r) => r._id.toString() === id);
  },

  getByTest: async (testId: string) => {
    const test = await testRepository.findById(testId);
    if (!test) throw new NotFoundError('Test');

    const results = await resultRepository.findByTest(testId);
    const marks = results.map((r) => r.obtainedMarks);
    const highestMarks = marks.length > 0 ? Math.max(...marks) : 0;
    const averageMarks = marks.length > 0
      ? Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 100) / 100
      : 0;

    return { test, results, stats: { highestMarks, averageMarks, totalStudents: results.length } };
  },

  getByStudent: async (studentId: string) => {
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) throw new NotFoundError('Student');
    return resultRepository.findByStudent(studentId);
  },

  getStudentRankSummary: async (studentId: string) => {
    const results = await resultRepository.findByStudent(studentId);
    if (results.length === 0) return { latestRank: null, averagePercentage: 0, totalTests: 0 };

    const latest = results[0];
    const averagePercentage = Math.round(
      (results.reduce((sum, r) => sum + r.percentage, 0) / results.length) * 100
    ) / 100;

    return {
      latestRank: latest.rank,
      latestMarks: latest.obtainedMarks,
      latestTest: latest.testId,
      averagePercentage,
      totalTests: results.length,
    };
  },
};
