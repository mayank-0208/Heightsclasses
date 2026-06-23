'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, ArrowLeftRight, UserCheck, Calendar, MapPin, Eye, X } from 'lucide-react';
import { User, StudentProfile } from '@/types';
import { useSearchParams } from 'next/navigation';

export default function StudentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('search') || '';
  
  // Search & Filter state
  const [search, setSearch] = useState(querySearch);
  const [page, setPage] = useState(1);
  const [batchFilter, setBatchFilter] = useState('');

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);
  
  // Add Student modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Student@12345');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateOfBirth, setDateOfBirth] = useState('2010-01-01');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [totalFee, setTotalFee] = useState(15000);
  
  // View Details Modal state
  const [viewStudent, setViewStudent] = useState<any | null>(null);

  // Fetch student items
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', page, search, batchFilter],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search.trim()) params.search = search;
      if (batchFilter) params.batchId = batchFilter;
      const res = await api.get('/students', { params });
      return res.data.data;
    },
  });

  // Fetch batches for filter / assignment selection
  const { data: batchesData } = useQuery({
    queryKey: ['batchesList', user?.role],
    queryFn: async () => {
      const endpoint = user?.role === 'teacher' ? '/batches/my-batches' : '/batches';
      const res = await api.get(endpoint);
      return Array.isArray(res.data.data) ? res.data.data : (res.data.data.items || []);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/students', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('Student@12345');
    setSelectedBatch('');
    setFatherName('');
    setMotherName('');
    setAddress('');
    setEmergencyContact('');
    setTotalFee(15000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    registerMutation.mutate({
      fullName,
      email,
      phone,
      password,
      batch: selectedBatch,
      fatherName,
      motherName,
      address,
      joiningDate,
      dateOfBirth,
      emergencyContact,
      totalFee: Number(totalFee),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const openViewModal = async (studentId: string) => {
    try {
      const res = await api.get(`/students/${studentId}`);
      if (res.data.success) {
        setViewStudent(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  const items = studentsData?.items || [];
  const pagination = studentsData?.pagination;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage enrolled student rosters, batch listings, and academic profiles.</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            <Plus className="h-5 w-5" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or Student ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
          />
        </div>
        <select
          value={batchFilter}
          onChange={(e) => {
            setBatchFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none transition-colors"
        >
          <option value="">All Batches</option>
          {batchesData?.map((b: any) => (
            <option key={b._id} value={b._id}>
              {b.batchName}
            </option>
          ))}
        </select>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs overflow-hidden">
        {studentsLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-850/10">
                  <th className="p-4">Name</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Email</th>
                  {isAdmin && <th className="p-4">Phone</th>}
                  <th className="p-4">Batch</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((student: User) => (
                  <tr key={student._id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 text-sm">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{student.fullName}</td>
                    <td className="p-4 font-mono text-xs text-slate-500">{student.studentId || 'N/A'}</td>
                    <td className="p-4 text-slate-500">{student.email}</td>
                    {isAdmin && <td className="p-4 text-slate-500">{student.phone}</td>}
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {typeof student.batch === 'object' && student.batch !== null ? (student.batch as any).batchName : 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openViewModal(student._id)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-16">No students found matching current filters.</div>
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

      {/* REGISTER STUDENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-bold">Register New Student</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              
              {/* Basic Account Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 uppercase tracking-wider mb-1.5">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white"
                    placeholder="student@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white"
                    placeholder="10-digit phone"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Default Password</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Course Assignment */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Assign Batch</label>
                  <select
                    required
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  >
                    <option value="">Select a batch...</option>
                    {batchesData?.map((b: any) => (
                      <option key={b._id} value={b._id}>
                        {b.batchName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Total Course Fee (INR)</label>
                  <input
                    type="number"
                    value={totalFee}
                    onChange={(e) => setTotalFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Parents Profile info */}
              <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Father's Name</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                    placeholder="Father's full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Mother's Name</label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                    placeholder="Mother's full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Emergency Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                    placeholder="Emergency phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Home Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  placeholder="Street details, city, state"
                />
              </div>

              <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm transition-all disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Register Student'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setViewStudent(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold">Academic Profile</h3>
              <button onClick={() => setViewStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                <div className="h-12 w-12 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-lg">
                  {viewStudent.user?.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{viewStudent.user?.fullName}</h4>
                  <span className="font-mono text-xs text-slate-450 uppercase">{viewStudent.user?.studentId}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-455 font-semibold">Email</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{viewStudent.user?.email}</span>
                </div>
                {isAdmin && (
                  <div className="grid grid-cols-3 py-1">
                    <span className="text-slate-455 font-semibold">Phone</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-200">{viewStudent.user?.phone || 'N/A'}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-455 font-semibold">Father</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{viewStudent.profile?.fatherName}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-455 font-semibold">Mother</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{viewStudent.profile?.motherName}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-455 font-semibold">DOB</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">
                    {new Date(viewStudent.profile?.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-455 font-semibold">Emergency</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{viewStudent.profile?.emergencyContact}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-455 font-semibold">Address</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200">{viewStudent.profile?.address}</span>
                </div>
              </div>

              <div className="flex border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 justify-end">
                <button
                  onClick={() => setViewStudent(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold text-sm transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
