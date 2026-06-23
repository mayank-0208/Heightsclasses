'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Calendar, User, Search, CheckCircle2, AlertCircle, Clock, Save } from 'lucide-react';
import { AttendanceStatus } from '@/types';

export default function AttendancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'mark' | 'logs'>('logs');
  
  // Mark Attendance State
  const [markBatch, setMarkBatch] = useState('');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, {
    status: AttendanceStatus;
    entryTime?: string;
    exitTime?: string;
    remarks?: string;
  }>>({});

  // Filter state for Reports
  const [reportBatch, setReportBatch] = useState('');
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportPage, setReportPage] = useState(1);

  const isStudent = user?.role === 'student';

  // Set default tab for students
  React.useEffect(() => {
    if (isStudent) {
      setActiveTab('logs');
    } else {
      setActiveTab('mark');
    }
  }, [isStudent]);

  // Fetch batches
  const { data: batchesData } = useQuery({
    queryKey: ['batchesList'],
    queryFn: async () => {
      const endpoint = user?.role === 'teacher' ? '/batches/my-batches' : '/batches';
      const res = await api.get(endpoint);
      return Array.isArray(res.data.data) ? res.data.data : (res.data.data.items || []);
    },
  });

  // Fetch students by batch (for marking)
  const { data: studentsInBatch, isLoading: studentsLoading } = useQuery({
    queryKey: ['studentsInBatch', markBatch],
    enabled: !!markBatch && activeTab === 'mark',
    queryFn: async () => {
      const res = await api.get(`/students/batch/${markBatch}`);
      const students = res.data.data || [];
      
      // Initialize records
      const initial: typeof attendanceRecords = {};
      students.forEach((s: any) => {
        initial[s._id] = { status: 'Present', entryTime: '09:00 AM', exitTime: '02:00 PM', remarks: '' };
      });
      setAttendanceRecords(initial);
      return students;
    },
  });

  // Fetch reports / Student logs
  const { data: attendanceData, isLoading: logsLoading } = useQuery({
    queryKey: ['attendanceLogs', reportBatch, reportStart, reportEnd, reportPage, isStudent],
    queryFn: async () => {
      if (isStudent) {
        // Students fetch their own logs
        const res = await api.get(`/attendance/student/${user?._id}`, {
          params: { startDate: reportStart || undefined, endDate: reportEnd || undefined }
        });
        return { items: res.data.data || [], pagination: null };
      } else {
        // Admins/Teachers fetch global reports
        const res = await api.get('/attendance/report', {
          params: {
            batchId: reportBatch || undefined,
            startDate: reportStart || undefined,
            endDate: reportEnd || undefined,
            page: reportPage,
            limit: 15,
          }
        });
        return res.data.data;
      }
    },
  });

  // Fetch analytics for headers
  const { data: analyticsData } = useQuery({
    queryKey: ['attendanceAnalytics', reportBatch, isStudent],
    queryFn: async () => {
      const params: any = {};
      if (isStudent) {
        params.studentId = user?._id;
      } else if (reportBatch) {
        params.batchId = reportBatch;
      }
      const res = await api.get('/attendance/analytics', { params });
      return res.data.data;
    },
  });

  // Bulk save mutation
  const markBulkMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/attendance/bulk', payload);
      return res.data;
    },
    onSuccess: () => {
      alert('Attendance saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceAnalytics'] });
    },
  });

  const handleRecordChange = (studentId: string, field: string, value: any) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markBatch) return;

    const records = Object.entries(attendanceRecords).map(([studentId, data]) => ({
      studentId,
      ...data,
    }));

    markBulkMutation.mutate({
      date: markDate,
      records,
    });
  };

  const logs = attendanceData?.items || [];
  const pagination = attendanceData?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Mark daily classroom presence and view analytics reports.</p>
      </div>

      {/* Analytics Summary Banner */}
      {analyticsData && (
        <div className="grid gap-4 sm:grid-cols-4 bg-white p-6 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider">Attendance Rate</span>
            <span className={`text-2xl font-black block mt-1 ${
              analyticsData.percentage >= 75 ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {analyticsData.percentage}%
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider">Present Count</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">{analyticsData.presentCount}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider">Absent Count</span>
            <span className="text-2xl font-black text-red-500 block mt-1">{analyticsData.absentCount}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider">Total Records</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">{analyticsData.total}</span>
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      {!isStudent && (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'mark'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mark Presence
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Attendance History
          </button>
        </div>
      )}

      {/* TAB 1: MARK ATTENDANCE */}
      {activeTab === 'mark' && !isStudent && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid gap-4 sm:grid-cols-3 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Select Course/Batch</label>
              <select
                value={markBatch}
                onChange={(e) => setMarkBatch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none"
              >
                <option value="">Choose a batch...</option>
                {batchesData?.map((b: any) => (
                  <option key={b._id} value={b._id}>
                    {b.batchName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Attendance Date</label>
              <input
                type="date"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          {markBatch ? (
            studentsLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : studentsInBatch && studentsInBatch.length > 0 ? (
              <form onSubmit={handleSaveAttendance} className="space-y-6 bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-850/10">
                        <th className="p-4">Student</th>
                        <th className="p-4">Roll/ID</th>
                        <th className="p-4">Presence Status</th>
                        <th className="p-4">Hours (In - Out)</th>
                        <th className="p-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsInBatch.map((student: any) => {
                        const record = attendanceRecords[student._id] || { status: 'Present' };
                        return (
                          <tr key={student._id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 text-sm">
                            <td className="p-4 font-semibold text-slate-900 dark:text-white">{student.fullName}</td>
                            <td className="p-4 text-xs font-mono text-slate-500">{student.studentId}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                {(['Present', 'Absent', 'Late', 'Half-Day'] as AttendanceStatus[]).map((status) => (
                                  <button
                                    type="button"
                                    key={status}
                                    onClick={() => handleRecordChange(student._id, 'status', status)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                      record.status === status
                                        ? status === 'Present'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                          : status === 'Absent'
                                          ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                                          : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
                                        : 'bg-white text-slate-650 border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-450 hover:bg-slate-50'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <input
                                  type="text"
                                  placeholder="09:00 AM"
                                  value={record.entryTime || ''}
                                  onChange={(e) => handleRecordChange(student._id, 'entryTime', e.target.value)}
                                  className="w-20 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg py-1 px-2 text-center text-xs focus:outline-none"
                                />
                                <span>-</span>
                                <input
                                  type="text"
                                  placeholder="02:00 PM"
                                  value={record.exitTime || ''}
                                  onChange={(e) => handleRecordChange(student._id, 'exitTime', e.target.value)}
                                  className="w-20 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg py-1 px-2 text-center text-xs focus:outline-none"
                                />
                              </div>
                            </td>
                            <td className="p-4">
                              <input
                                type="text"
                                placeholder="Add optional note"
                                value={record.remarks || ''}
                                onChange={(e) => handleRecordChange(student._id, 'remarks', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg py-1 px-2.5 text-xs focus:outline-none"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex border-t border-slate-100 dark:border-slate-800 p-4 justify-end">
                  <button
                    type="submit"
                    disabled={markBulkMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm transition-all disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm"
                  >
                    {markBulkMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Submit Attendance</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center text-slate-400 py-16 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl">No students registered in this batch.</div>
            )
          ) : (
            <div className="text-center text-slate-400 py-16 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl">Please select a batch above to load student records.</div>
          )}
        </div>
      )}

      {/* TAB 2: ATTENDANCE HISTORY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-3 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
            {!isStudent && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Filter Batch</label>
                <select
                  value={reportBatch}
                  onChange={(e) => {
                    setReportBatch(e.target.value);
                    setReportPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none"
                >
                  <option value="">All Batches</option>
                  {batchesData?.map((b: any) => (
                    <option key={b._id} value={b._id}>
                      {b.batchName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Start Date</label>
              <input
                type="date"
                value={reportStart}
                onChange={(e) => {
                  setReportStart(e.target.value);
                  setReportPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">End Date</label>
              <input
                type="date"
                value={reportEnd}
                onChange={(e) => {
                  setReportEnd(e.target.value);
                  setReportPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs overflow-hidden">
            {logsLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-850/10">
                      <th className="p-4">Date</th>
                      {!isStudent && <th className="p-4">Student</th>}
                      {!isStudent && <th className="p-4">Batch</th>}
                      <th className="p-4">Status</th>
                      <th className="p-4">Check In/Out</th>
                      <th className="p-4">Remarks</th>
                      {!isStudent && <th className="p-4">Marked By</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((record: any) => (
                      <tr key={record._id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 text-sm">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        {!isStudent && (
                          <td className="p-4 font-semibold text-slate-900 dark:text-white">
                            {record.studentId?.fullName || 'N/A'}
                          </td>
                        )}
                        {!isStudent && (
                          <td className="p-4">
                            <span className="inline-flex rounded-full bg-slate-150 px-2.5 py-0.5 text-xs font-medium dark:bg-slate-800">
                              {batchesData?.find((b: any) => b._id === record.studentId?.batch)?.batchName || 'Default Class'}
                            </span>
                          </td>
                        )}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-0.5 select-none ${
                            record.status === 'Present'
                              ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                              : record.status === 'Absent'
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {record.status === 'Present' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : record.status === 'Absent' ? (
                              <AlertCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-xs">
                          {record.entryTime || 'N/A'} - {record.exitTime || 'N/A'}
                        </td>
                        <td className="p-4 text-slate-500 italic max-w-xs truncate">{record.remarks || '—'}</td>
                        {!isStudent && (
                          <td className="p-4 text-xs text-slate-500">
                            {record.markedBy?.fullName || 'System'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-16">No attendance records found matching filters.</div>
            )}

            {/* Pagination for admin/teacher */}
            {!isStudent && pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  disabled={reportPage === 1}
                  onClick={() => setReportPage(reportPage - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 disabled:opacity-50 text-xs font-semibold transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-450 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={reportPage === pagination.totalPages}
                  onClick={() => setReportPage(reportPage + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 disabled:opacity-50 text-xs font-semibold transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
