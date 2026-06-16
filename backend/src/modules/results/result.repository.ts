import { Result, IResult } from './result.model';

export const resultRepository = {
  create: (data: Partial<IResult>): Promise<IResult> => Result.create(data),

  findById: (id: string): Promise<IResult | null> =>
    Result.findById(id)
      .populate('studentId', 'fullName studentId')
      .populate('testId', 'testName subject totalMarks testDate')
      .exec(),

  update: (id: string, data: Partial<IResult>): Promise<IResult | null> =>
    Result.findByIdAndUpdate(id, data, { new: true })
      .populate('studentId', 'fullName studentId')
      .populate('testId', 'testName subject totalMarks testDate')
      .exec(),

  findByTest: (testId: string): Promise<IResult[]> =>
    Result.find({ testId })
      .populate('studentId', 'fullName studentId')
      .sort({ rank: 1 })
      .exec(),

  findByStudent: (studentId: string): Promise<IResult[]> =>
    Result.find({ studentId })
      .populate('testId', 'testName subject totalMarks testDate batchId')
      .sort({ createdAt: -1 })
      .exec(),

  findByStudentAndTest: (studentId: string, testId: string): Promise<IResult | null> =>
    Result.findOne({ studentId, testId }).exec(),

  deleteByTest: (testId: string): Promise<void> => {
    return Result.deleteMany({ testId }).exec().then(() => undefined);
  },
};
