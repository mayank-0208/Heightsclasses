import { PaginationQuery, PaginatedResult } from '../types';
import { FilterQuery, Model, SortOrder } from 'mongoose';

export const getPaginationParams = (query: PaginationQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder: SortOrder = query.sortOrder === 'asc' ? 1 : -1;
  return { page, limit, skip, sortBy, sortOrder };
};

export const buildSearchFilter = (
  search: string | undefined,
  fields: string[]
): Record<string, unknown> => {
  if (!search?.trim()) return {};
  const regex = { $regex: search.trim(), $options: 'i' };
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

export const paginate = async <T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  query: PaginationQuery,
  searchFields: string[] = [],
  populate?: string | string[]
): Promise<PaginatedResult<T>> => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
  const searchFilter = buildSearchFilter(query.search, searchFields);
  const combinedFilter = { ...filter, ...searchFilter };

  let queryBuilder = model
    .find(combinedFilter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }

  const [items, total] = await Promise.all([
    queryBuilder.exec(),
    model.countDocuments(combinedFilter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const calculateRank = (
  results: { studentId: string; obtainedMarks: number }[]
): Map<string, number> => {
  const sorted = [...results].sort((a, b) => b.obtainedMarks - a.obtainedMarks);
  const rankMap = new Map<string, number>();
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].obtainedMarks < sorted[i - 1].obtainedMarks) {
      currentRank = i + 1;
    }
    rankMap.set(sorted[i].studentId, currentRank);
  }

  return rankMap;
};

export const calculatePercentage = (obtained: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.round((obtained / total) * 10000) / 100;
};
