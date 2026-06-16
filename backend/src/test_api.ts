import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { User } from './modules/auth/user.model';
import { authRepository } from './modules/auth/auth.repository';

const BASE_URL = `http://localhost:${env.port}/api/v1`;

interface TestContext {
  adminToken?: string;
  teacherToken?: string;
  studentToken?: string;
  teacherId?: string;
  studentId?: string;
  batchId?: string;
  testId?: string;
  feeId?: string;
  announcementId?: string;
  noteId?: string;
  resultId?: string;
}

const context: TestContext = {};

function expect(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function request(
  path: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    isMultipart?: boolean;
  } = {}
) {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {};

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  let body = options.body;
  if (body && !options.isMultipart) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Not JSON
  }

  return {
    status: res.status,
    ok: res.ok,
    json,
    text,
  };
}

async function runTests() {
  console.log('=== COACHING ERP API TEST RUNNER ===');
  console.log(`Targeting Base URL: ${BASE_URL}\n`);

  console.log('Connecting to database...');
  await connectDatabase();
  console.log('Connected. Resetting Admin password to the env value in DB...');
  
  const adminEmail = env.ADMIN_EMAIL || 'admin@coaching.com';
  const adminPassword = env.ADMIN_PASSWORD || 'Admin@12345';
  const hashed = await authRepository.hashPassword(adminPassword);
  
  await User.updateOne(
    { email: adminEmail },
    { $set: { password: hashed, isActive: true, mustChangePassword: false } },
    { upsert: true }
  );
  console.log('Admin password synchronized.\n');

  const tests = [
    {
      name: '01. Health Check',
      fn: async () => {
        const res = await request('/health');
        expect(res.status === 200, `Expected status 200, got ${res.status}`);
        expect(res.json?.success === true, 'Expected success to be true');
        expect(res.json?.data?.status === 'ok', 'Expected status ok');
      },
    },
    {
      name: '02. Admin Login (Seed Data)',
      fn: async () => {
        const res = await request('/auth/login', {
          method: 'POST',
          body: {
            email: adminEmail,
            password: adminPassword,
          },
        });
        expect(res.status === 200, `Expected status 200, got ${res.status}`);
        expect(res.json?.success === true, 'Login response success false');
        expect(!!res.json?.data?.accessToken, 'No access token returned');
        context.adminToken = res.json.data.accessToken;
      },
    },
    {
      name: '03. Create Teacher User (Admin Access)',
      fn: async () => {
        const randomStr = Math.random().toString(36).substring(7);
        const res = await request('/auth/users', {
          method: 'POST',
          token: context.adminToken,
          body: {
            fullName: `Teacher John ${randomStr}`,
            email: `teacher.${randomStr}@coaching.com`,
            phone: '9876543210',
            password: 'Password@123',
            role: 'teacher',
          },
        });
        expect(res.status === 201, `Expected status 201, got ${res.status}`);
        expect(res.json?.data?.role === 'teacher', 'User created is not a teacher');
        context.teacherId = res.json.data._id;
      },
    },
    {
      name: '04. Create Batch (Admin Access)',
      fn: async () => {
        expect(!!context.teacherId, 'Teacher ID is missing');
        const randomStr = Math.random().toString(36).substring(7);
        const res = await request('/batches', {
          method: 'POST',
          token: context.adminToken,
          body: {
            batchName: `Batch Class-${randomStr}`,
            description: 'Intensive Mathematics and Science Course',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            assignedTeacher: context.teacherId,
          },
        });
        expect(res.status === 201, `Expected status 201, got ${res.status}`);
        expect(res.json?.data?.batchName.startsWith('Batch Class-'), 'Incorrect batch name');
        context.batchId = res.json.data._id;
      },
    },
    {
      name: '05. Create Student (Admin Access)',
      fn: async () => {
        expect(!!context.batchId, 'Batch ID is missing');
        const randomStr = Math.random().toString(36).substring(7);
        const res = await request('/students', {
          method: 'POST',
          token: context.adminToken,
          body: {
            fullName: `Student Alice ${randomStr}`,
            email: `student.${randomStr}@coaching.com`,
            phone: '9123456780',
            password: 'Password@123',
            batch: context.batchId,
            fatherName: 'Bob Smith',
            motherName: 'Cindy Smith',
            address: '123 Main Street, New Delhi',
            joiningDate: new Date(),
            dateOfBirth: new Date(2010, 5, 15),
            emergencyContact: '9988776655',
            totalFee: 15000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        expect(res.status === 201, `Expected status 201, got ${res.status}`);
        expect(res.json?.data?.user?.role === 'student', 'User created is not a student');
        expect(res.json?.data?.profile?.fatherName === 'Bob Smith', 'Father name mismatch');
        context.studentId = res.json.data.user._id;
      },
    },
    {
      name: '06. Get Student Profile & Verify Automatic Fee Record Creation',
      fn: async () => {
        expect(!!context.studentId, 'Student ID is missing');
        const res = await request(`/students/${context.studentId}`, {
          token: context.adminToken,
        });
        expect(res.status === 200, `Expected status 200, got ${res.status}`);
        expect(res.json?.data?.user?.fullName !== undefined, 'User data is missing in getStudent');
        
        // Let's verify fees list contains a record for this student
        const feeRes = await request(`/fees/student/${context.studentId}`, {
          token: context.adminToken,
        });
        expect(feeRes.status === 200, `Expected status 200, got ${feeRes.status}`);
        expect(feeRes.json?.data?.totalFee === 15000, 'Fee record not created correctly or mismatch');
        context.feeId = feeRes.json.data._id;
      },
    },
    {
      name: '07. Student & Teacher Login',
      fn: async () => {
        // Find teacher email & student email dynamically
        const studentsList = await request('/students', { token: context.adminToken });
        const studentObj = studentsList.json?.data?.items?.find((s: any) => s._id === context.studentId);
        const teachersList = await request('/auth/users?role=teacher', { token: context.adminToken });
        const teacherObj = teachersList.json?.data?.items?.find((t: any) => t._id === context.teacherId);
        
        expect(!!studentObj, 'Student email not found in listing');
        expect(!!teacherObj, 'Teacher email not found in listing');

        // Teacher Login
        const tLogin = await request('/auth/login', {
          method: 'POST',
          body: { email: teacherObj.email, password: 'Password@123' },
        });
        expect(tLogin.status === 200, 'Teacher login failed');
        context.teacherToken = tLogin.json?.data?.accessToken;

        // Student Login
        const sLogin = await request('/auth/login', {
          method: 'POST',
          body: { email: studentObj.email, password: 'Password@123' },
        });
        expect(sLogin.status === 200, 'Student login failed');
        context.studentToken = sLogin.json?.data?.accessToken;
      },
    },
    {
      name: '08. RBAC Validation (Forbidden Boundaries)',
      fn: async () => {
        // Student attempting to list all students (should be forbidden)
        const res1 = await request('/students', { token: context.studentToken });
        expect(res1.status === 403, `Expected student list access to return 403 for student, got ${res1.status}`);

        // Student attempting to fetch another student profile by ID
        const res2 = await request('/students/653b47fcf1f4094e9cf74513', { token: context.studentToken }); // Random ObjectID
        expect(res2.status === 403, `Expected student cross-profile access to return 403, got ${res2.status}`);

        // Student trying to view global audit logs (admin only)
        const res3 = await request('/audit-logs', { token: context.studentToken });
        expect(res3.status === 403, `Expected audit-log access to return 403 for student, got ${res3.status}`);

        // Teacher trying to access admin-only student creation
        const res4 = await request('/students', {
          method: 'POST',
          token: context.teacherToken,
          body: {},
        });
        expect(res4.status === 403, `Expected student creation to return 403 for teacher, got ${res4.status}`);
      },
    },
    {
      name: '09. Mark Attendance (Teacher & Admin)',
      fn: async () => {
        expect(!!context.studentId, 'Student ID missing');
        const todayStr = new Date().toISOString().split('T')[0];

        // Mark present
        const res = await request('/attendance', {
          method: 'POST',
          token: context.teacherToken,
          body: {
            studentId: context.studentId,
            date: todayStr,
            status: 'Present',
            entryTime: '09:00 AM',
            exitTime: '02:00 PM',
            remarks: 'On time',
          },
        });
        expect(res.status === 201, `Expected status 201, got ${res.status}`);
        expect(res.json?.data?.status === 'Present', 'Attendance status not present');

        // Edge Case: Mark same student on same day again (should fail with ConflictError 409)
        const resConflict = await request('/attendance', {
          method: 'POST',
          token: context.teacherToken,
          body: {
            studentId: context.studentId,
            date: todayStr,
            status: 'Absent',
          },
        });
        expect(resConflict.status === 409, `Expected duplicate attendance to fail with 409, got ${resConflict.status}`);
      },
    },
    {
      name: '10. Bulk Mark Attendance (Teacher Access)',
      fn: async () => {
        expect(!!context.studentId, 'Student ID missing');
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const res = await request('/attendance/bulk', {
          method: 'POST',
          token: context.teacherToken,
          body: {
            date: tomorrow,
            records: [
              {
                studentId: context.studentId,
                status: 'Late',
                entryTime: '09:35 AM',
                exitTime: '02:00 PM',
                remarks: 'Late due to traffic',
              },
            ],
          },
        });
        expect(res.status === 201, `Expected status 201, got ${res.status}`);
        expect(res.json?.data?.[0]?.status === 'Late', 'Bulk attendance status mismatch');
      },
    },
    {
      name: '11. Test Creation (Teacher Access)',
      fn: async () => {
        expect(!!context.batchId, 'Batch ID missing');
        const res = await request('/tests', {
          method: 'POST',
          token: context.teacherToken,
          body: {
            testName: 'Midterm Algebra Test',
            subject: 'Mathematics',
            totalMarks: 100,
            batchId: context.batchId,
            testDate: new Date(),
          },
        });
        expect(res.status === 201, `Expected status 201, got ${res.status}`);
        expect(res.json?.data?.totalMarks === 100, 'Total marks mismatch');
        context.testId = res.json.data._id;
      },
    },
    {
      name: '12. Enter Test Results & Edge Cases',
      fn: async () => {
        expect(!!context.studentId && !!context.testId, 'Student or Test ID missing');

        // Edge Case: Obtained marks exceed total marks (should fail with ValidationError 422)
        const resExceed = await request('/results', {
          method: 'POST',
          token: context.teacherToken,
          body: {
            studentId: context.studentId,
            testId: context.testId,
            obtainedMarks: 120, // Test total is 100
          },
        });
        expect(resExceed.status === 422, `Expected obtained marks > total marks to fail with 422, got ${resExceed.status}`);

        // Enter valid marks (85 out of 100)
        const resValid = await request('/results', {
          method: 'POST',
          token: context.teacherToken,
          body: {
            studentId: context.studentId,
            testId: context.testId,
            obtainedMarks: 85,
          },
        });
        expect(resValid.status === 201, `Expected status 201, got ${resValid.status}`);
        expect(resValid.json?.data?.obtainedMarks === 85, 'Obtained marks mismatch');
        expect(resValid.json?.data?.percentage === 85, 'Percentage mismatch');
        context.resultId = resValid.json.data._id;
      },
    },
    {
      name: '13. Notes Upload (Teacher Access with Mock Cloudinary Fallback)',
      fn: async () => {
        expect(!!context.batchId, 'Batch ID missing');

        const formData = new FormData();
        formData.append('title', 'Introduction to Trigonometry');
        formData.append('description', 'Comprehensive formula sheet and exercise questions');
        formData.append('subject', 'Mathematics');
        formData.append('batchId', context.batchId);
        
        // Create a dummy text file blob to upload
        const dummyFile = new Blob(['Mock note pdf contents'], { type: 'application/pdf' });
        formData.append('file', dummyFile, 'trig_notes.pdf');

        const res = await request('/notes', {
          method: 'POST',
          token: context.teacherToken,
          body: formData,
          isMultipart: true,
        });

        expect(res.status === 201, `Expected status 201, got ${res.status}`);
        expect(res.json?.data?.title === 'Introduction to Trigonometry', 'Note title mismatch');
        expect(res.json?.data?.fileUrl !== undefined, 'Uploaded file URL missing');
        context.noteId = res.json.data._id;
      },
    },
    {
      name: '14. Fee Payments & History Tracking (Admin Access)',
      fn: async () => {
        expect(!!context.feeId, 'Fee ID is missing');

        // Pay 5000 towards the 15000 fee
        const paymentRes = await request(`/fees/${context.feeId}/payment`, {
          method: 'POST',
          token: context.adminToken,
          body: {
            amount: 5000,
            paymentDate: new Date(),
            paymentMethod: 'Cash',
            transactionId: 'TXN-99999',
            remarks: 'First installment payment',
          },
        });
        expect(paymentRes.status === 200, `Expected status 200, got ${paymentRes.status}`);
        expect(paymentRes.json?.data?.paidFee === 5000, 'Paid fee mismatch');
        expect(paymentRes.json?.data?.pendingFee === 10000, 'Pending fee mismatch');
        expect(paymentRes.json?.data?.paymentHistory?.length === 1, 'Payment history length incorrect');
        expect(paymentRes.json?.data?.paymentHistory[0].transactionId === 'TXN-99999', 'Transaction ID mismatch');
      },
    },
    {
      name: '15. Announcements target batching and read tracking',
      fn: async () => {
        expect(!!context.batchId, 'Batch ID missing');

        // Admin creates batch-specific announcement
        const resAnnounce = await request('/announcements', {
          method: 'POST',
          token: context.adminToken,
          body: {
            title: 'Algebra Quiz Announcement',
            content: 'Please prepare Chapter 1 and 2 formulas for quiz next week.',
            targetBatch: context.batchId,
          },
        });
        expect(resAnnounce.status === 201, `Expected status 201, got ${resAnnounce.status}`);
        context.announcementId = resAnnounce.json?.data?._id;

        // Student marks announcement as read
        const resRead = await request(`/announcements/${context.announcementId}/read`, {
          method: 'POST',
          token: context.studentToken,
        });
        expect(resRead.status === 200, `Expected status 200, got ${resRead.status}`);
        expect(resRead.json?.data?.readBy?.length === 1, 'Read tracking failed');
      },
    },
    {
      name: '16. Dashboard Endpoints (Admin, Teacher, Student)',
      fn: async () => {
        // Admin Dashboard
        const dAdmin = await request('/dashboard/admin', { token: context.adminToken });
        expect(dAdmin.status === 200, 'Admin dashboard failed');
        expect(dAdmin.json?.data?.cards?.totalStudents !== undefined, 'Admin dashboard missing totalStudents');

        // Teacher Dashboard
        const dTeacher = await request('/dashboard/teacher', { token: context.teacherToken });
        expect(dTeacher.status === 200, 'Teacher dashboard failed');

        // Student Dashboard
        const dStudent = await request('/dashboard/student', { token: context.studentToken });
        expect(dStudent.status === 200, 'Student dashboard failed');
        expect(dStudent.json?.data?.cards?.latestMarks !== undefined, 'Student dashboard missing latestMarks');
      },
    },
    {
      name: '17. Reports Exporting (Admin / Teacher Access)',
      fn: async () => {
        // Attendance report download
        const repAttendance = await request('/reports/attendance', { token: context.teacherToken });
        expect(repAttendance.status === 200, 'Attendance report failed');

        // Result report download
        const repResult = await request('/reports/results', { token: context.teacherToken });
        expect(repResult.status === 200, 'Result report failed');

        // Fee report download (Admin only)
        const repFee = await request('/reports/fees', { token: context.adminToken });
        expect(repFee.status === 200, 'Fee report failed');
        
        // Fee report download (Teacher should be unauthorized)
        const repFeeTeacher = await request('/reports/fees', { token: context.teacherToken });
        expect(repFeeTeacher.status === 403, 'Teacher should be forbidden from fee reports');
      },
    },
    {
      name: '18. Audit Logs (Admin Access)',
      fn: async () => {
        const resLogs = await request('/audit-logs', { token: context.adminToken });
        expect(resLogs.status === 200, 'Audit logs retrieval failed');
        expect(resLogs.json?.data?.items?.length > 0, 'No audit logs were registered');
      },
    },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const test of tests) {
    try {
      console.log(`⏳ Running: ${test.name}...`);
      await test.fn();
      console.log(`✅ Passed: ${test.name}\n`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed: ${test.name}`);
      console.error(`   Error details: ${error.message || error}\n`);
      failCount++;
    }
  }

  console.log('=== TEST RESULT SUMMARY ===');
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total:  ${tests.length}`);

  // Close MongoDB connection
  await mongoose.connection.close();
  console.log('Database connection closed.');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(async (err) => {
  console.error('Test execution failed completely', err);
  await mongoose.connection.close();
  process.exit(1);
});
