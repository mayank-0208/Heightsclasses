export type UserRole = 'admin' | 'teacher' | 'student';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half-Day';

export interface User {
  _id: string;
  fullName: string;
  studentId?: string;
  email: string;
  phone: string;
  role: UserRole;
  batch?: string | Batch;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  _id: string;
  userId: string | User;
  fatherName: string;
  motherName: string;
  address: string;
  joiningDate: string;
  dateOfBirth: string;
  emergencyContact: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetail {
  user: User;
  profile: StudentProfile | null;
}

export interface Batch {
  _id: string;
  batchName: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedTeacher: string | User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  studentId: string | User;
  date: string;
  status: AttendanceStatus;
  entryTime?: string;
  exitTime?: string;
  remarks?: string;
  markedBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  _id: string;
  testName: string;
  subject: string;
  totalMarks: number;
  batchId: string | Batch;
  testDate: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Result {
  _id: string;
  studentId: string | User;
  testId: string | Test;
  obtainedMarks: number;
  percentage: number;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  title: string;
  description: string;
  subject: string;
  batchId: string | Batch;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedBy: string | User;
  uploadedAt: string;
}

export interface PaymentRecord {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
  recordedBy: string | User;
  _id: string;
}

export interface Fee {
  _id: string;
  studentId: string | User;
  totalFee: number;
  paidFee: number;
  pendingFee: number;
  dueDate: string;
  paymentHistory: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  targetBatch?: string | Batch;
  createdBy: string | User;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  userId: string | User;
  action: string;
  ipAddress: string;
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: PaginationInfo;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}
