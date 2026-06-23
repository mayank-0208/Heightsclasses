'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, Plus, ShieldAlert, X } from 'lucide-react';
import { Fee } from '@/types';

export default function FeesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activePanel, setActivePanel] = useState<'all' | 'defaulters'>('all');

  // Record Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [targetFee, setTargetFee] = useState<any | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  // Guard: if teacher, they shouldn't access this page
  if (user?.role === 'teacher') {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Access Denied</h3>
        <p className="text-sm text-slate-500 mt-2">Teachers do not have permissions to view student fee accounts.</p>
      </div>
    );
  }

  // Fetch student's own fee details (if student)
  const { data: studentFeeData, isLoading: studentFeeLoading } = useQuery({
    queryKey: ['studentFee', user?._id],
    enabled: isStudent,
    queryFn: async () => {
      const res = await api.get(`/fees/student/${user?._id}`);
      return res.data.data;
    },
  });

  // Fetch all fees ledgers (if admin)
  const { data: allFeesData = [], isLoading: allFeesLoading } = useQuery({
    queryKey: ['allFees', activePanel],
    enabled: isAdmin,
    queryFn: async () => {
      const endpoint = activePanel === 'defaulters' ? '/fees/defaulters' : '/fees';
      const res = await api.get(endpoint);
      const data = res.data.data;
      if (activePanel === 'defaulters') {
        return data || [];
      } else {
        return data?.items || [];
      }
    },
  });

  // Fetch collection report (if admin)
  const { data: collectionReport } = useQuery({
    queryKey: ['collectionReport'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get('/fees/pending-report');
      return res.data.data;
    },
  });

  // Record Payment Mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async (payload: { feeId: string; amount: number; paymentMethod: string; transactionId?: string; remarks?: string }) => {
      const { feeId, ...body } = payload;
      const res = await api.post(`/fees/${feeId}/payment`, {
        ...body,
        paymentDate: new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allFees'] });
      queryClient.invalidateQueries({ queryKey: ['collectionReport'] });
      setPaymentModalOpen(false);
      resetPaymentForm();
      alert('Payment recorded successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  });

  const resetPaymentForm = () => {
    setAmount(0);
    setPaymentMethod('Cash');
    setTransactionId('');
    setRemarks('');
    setTargetFee(null);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFee || amount <= 0) return;

    recordPaymentMutation.mutate({
      feeId: targetFee._id,
      amount,
      paymentMethod,
      transactionId: transactionId || undefined,
      remarks: remarks || undefined,
    });
  };

  const openPaymentModal = (fee: any) => {
    setTargetFee(fee);
    setAmount(fee.pendingFee);
    setPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Ledger Accounts</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isStudent ? 'Check your outstanding balance, payment schedules, and invoices.' : 'Review collections, manage accounts, and register student payments.'}
        </p>
      </div>

      {/* STUDENT FEES SUMMARY PANEL */}
      {isStudent && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {studentFeeLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : studentFeeData ? (
            <>
              {/* Cards row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider">Total Course Fee</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">
                    ₹{studentFeeData.totalFee.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider text-emerald-600">Total Paid</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                    ₹{studentFeeData.paidFee.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider text-red-500">Balance Pending</span>
                  <span className={`text-2xl font-black block mt-1 ${
                    studentFeeData.pendingFee > 0 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    ₹{studentFeeData.pendingFee.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-450 block mt-1 font-semibold">
                    Due Date: {new Date(studentFeeData.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Payment History logs */}
              <div className="bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs overflow-hidden">
                <h3 className="text-md font-bold p-4 border-b border-slate-150 dark:border-slate-850">Payment History Receipt Log</h3>
                {studentFeeData.paymentHistory?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-850/10">
                          <th className="p-4">Payment Date</th>
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Payment Method</th>
                          <th className="p-4">Amount Paid</th>
                          <th className="p-4">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentFeeData.paymentHistory.map((pmt: any) => (
                          <tr key={pmt._id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 text-sm">
                            <td className="p-4 font-semibold">
                              {new Date(pmt.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-mono text-xs text-slate-550">{pmt.transactionId || 'CASH_RECEIPT'}</td>
                            <td className="p-4">{pmt.paymentMethod}</td>
                            <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">₹{pmt.amount.toLocaleString()}</td>
                            <td className="p-4 text-slate-500 italic">{pmt.remarks || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-16">No payment transactions registered.</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 py-16 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl">No fee structure assigned. Please contact the administrator.</div>
          )}
        </div>
      )}

      {/* ADMIN FEES MANAGEMENT PANEL */}
      {isAdmin && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Collection summary header */}
          {collectionReport && (
            <div className="grid gap-4 sm:grid-cols-3 bg-white p-6 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider">Collected Fees</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                  ₹{collectionReport.totalCollected?.toLocaleString() || 0}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider text-red-500">Pending Fees</span>
                <span className="text-2xl font-black text-red-500 block mt-1">
                  ₹{collectionReport.totalPending?.toLocaleString() || 0}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block tracking-wider">Dues Defaulters</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">
                  {collectionReport.defaultersCount || 0} accounts
                </span>
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActivePanel('all')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                activePanel === 'all'
                  ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Fee Ledgers
            </button>
            <button
              onClick={() => setActivePanel('defaulters')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                activePanel === 'defaulters'
                  ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Defaulters List
            </button>
          </div>

          {/* Fee Ledgers Table */}
          <div className="bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs overflow-hidden">
            {allFeesLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : allFeesData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-850/10">
                      <th className="p-4">Student</th>
                      <th className="p-4">Roll/ID</th>
                      <th className="p-4 text-right">Total Course Fee</th>
                      <th className="p-4 text-right">Paid</th>
                      <th className="p-4 text-right">Pending Balance</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFeesData.map((fee: any) => (
                      <tr key={fee._id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 text-sm">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {fee.studentId?.fullName || 'N/A'}
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-500">{fee.studentId?.studentId}</td>
                        <td className="p-4 text-right">₹{fee.totalFee.toLocaleString()}</td>
                        <td className="p-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">₹{fee.paidFee.toLocaleString()}</td>
                        <td className="p-4 text-right text-red-500 font-bold">₹{fee.pendingFee.toLocaleString()}</td>
                        <td className="p-4 text-xs text-slate-550 font-medium">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          {fee.pendingFee > 0 ? (
                            <button
                              onClick={() => openPaymentModal(fee)}
                              className="px-3 py-1 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" /> Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-16">No fee ledgers found.</div>
            )}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentModalOpen && targetFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setPaymentModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold">Record Tuition Payment</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student: {targetFee.studentId?.fullName} | Balance: ₹{targetFee.pendingFee.toLocaleString()}
                </p>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Payment Amount (INR)</label>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="any"
                  max={targetFee.pendingFee}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online / UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Transaction ID / Ref</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                    placeholder="e.g. TXN-12345 (Optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Payment Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  placeholder="Installment number, cash details, etc. (Optional)"
                />
              </div>

              <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordPaymentMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm transition-all disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  {recordPaymentMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Record Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
