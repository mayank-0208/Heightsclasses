'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ShieldAlert, History, FileSpreadsheet, Download, Activity, Globe, Clock, User } from 'lucide-react';
import { AuditLog } from '@/types';

export default function ReportsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const isAdmin = user?.role === 'admin';

  // Guard: Admin access only
  if (!isAdmin) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Access Denied</h3>
        <p className="text-sm text-slate-500 mt-2">Only system administrators have permission to access logs and export collections.</p>
      </div>
    );
  }

  // Fetch audit logs
  const { data: auditLogsData, isLoading: logsLoading } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: async () => {
      const res = await api.get('/audit-logs', { params: { page, limit: 12 } });
      return res.data.data;
    },
  });

  const handleDownloadReport = async (reportType: 'attendance' | 'results' | 'fees') => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${api.defaults.baseURL}/reports/${reportType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        throw new Error('Report export failed');
      }

      // Convert stream to file download blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download report. Please check if your backend has exceljs configured correctly.');
    }
  };

  const logs = auditLogsData?.items || [];
  const pagination = auditLogsData?.pagination;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Reports & Audit</h1>
        <p className="text-sm text-slate-500 mt-1">Export database registries and review chronological system activity.</p>
      </div>

      {/* Export Reports section */}
      <div className="grid gap-6 sm:grid-cols-3">
        
        {/* Attendance report */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800 text-slate-900 dark:text-white w-fit">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold">Attendance Records</h3>
            <p className="mt-1 text-xs text-slate-500">Download complete presence rosters, monthly summaries, and percentages.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('attendance')}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-xs"
          >
            <Download className="h-4.5 w-4.5" />
            <span>Export Excel</span>
          </button>
        </div>

        {/* Results report */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800 text-slate-900 dark:text-white w-fit">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold">Exam Grades & Ranks</h3>
            <p className="mt-1 text-xs text-slate-500">Download student test results, average classes performance, and score indexes.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('results')}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-xs"
          >
            <Download className="h-4.5 w-4.5" />
            <span>Export Excel</span>
          </button>
        </div>

        {/* Fees report */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800 text-slate-900 dark:text-white w-fit">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold">Financial Ledgers</h3>
            <p className="mt-1 text-xs text-slate-500">Download tuition payment histories, collection summaries, and outstanding dues.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('fees')}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-xs"
          >
            <Download className="h-4.5 w-4.5" />
            <span>Export Excel</span>
          </button>
        </div>

      </div>

      {/* SYSTEM AUDIT LOGS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs overflow-hidden">
        <h3 className="text-md font-bold p-4 border-b border-slate-150 dark:border-slate-850 flex items-center gap-2">
          <History className="h-5 w-5 text-slate-400" />
          Chronological Audit Logs Trail
        </h3>
        
        {logsLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-850/10">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: AuditLog) => (
                  <tr key={log._id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 text-sm">
                    <td className="p-4 font-semibold text-slate-500 font-mono text-xs flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {typeof log.userId === 'object' && log.userId !== null ? (
                        <div className="flex flex-col">
                          <span>{(log.userId as any).fullName}</span>
                          <span className="text-[10px] text-slate-450 font-normal">{(log.userId as any).email}</span>
                        </div>
                      ) : (
                        'System / Admin'
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <Activity className="h-3.5 w-3.5 text-slate-500" />
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-500 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-16">No audit activities logged yet.</div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-150 dark:border-slate-800">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 disabled:opacity-50 text-xs font-semibold transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-450 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 disabled:opacity-50 text-xs font-semibold transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
