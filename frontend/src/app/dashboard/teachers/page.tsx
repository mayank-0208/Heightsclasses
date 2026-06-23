'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, Calendar, User, Eye, X, Phone, Mail } from 'lucide-react';

export default function TeachersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Add Teacher modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Teacher@12345');

  const isAdmin = user?.role === 'admin';

  // Fetch teachers
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachersList', page, search],
    enabled: isAdmin,
    queryFn: async () => {
      const params: any = { page, limit: 10, role: 'teacher' };
      if (search.trim()) params.search = search;
      const res = await api.get('/auth/users', { params });
      return res.data.data;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/auth/users', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachersList'] });
      setModalOpen(false);
      resetForm();
      alert('Teacher registered successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Teacher registration failed');
    }
  });

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('Teacher@12345');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      fullName,
      email,
      phone,
      password,
      role: 'teacher',
      mustChangePassword: true,
    });
  };

  const items = teachersData?.items || [];
  const pagination = teachersData?.pagination;

  // Guard: if not admin, show Access Denied
  if (user?.role !== 'admin') {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <X className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Access Denied</h3>
        <p className="text-sm text-slate-500 mt-2">Only administrators can manage faculty and teachers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage coaching faculty rosters, view contact details, and add new instructors.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            <Plus className="h-5 w-5" />
            <span>Add Teacher</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by teacher name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs overflow-hidden">
        {teachersLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-850/10">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Joining Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((teacher: any) => (
                  <tr key={teacher._id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 text-sm">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{teacher.fullName}</td>
                    <td className="p-4 text-slate-500">{teacher.email}</td>
                    <td className="p-4 text-slate-500">{teacher.phone}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        teacher.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-16">No teachers registered in the directory.</div>
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
            <span className="text-xs text-slate-455 font-medium">
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

      {/* REGISTER TEACHER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-bold">Register New Teacher</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-550 uppercase tracking-wider mb-1.5">Teacher Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-3.5 text-sm focus:outline-none"
                    placeholder="e.g. Prof. Ramesh Kumar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-3.5 text-sm focus:outline-none"
                    placeholder="teacher@coaching.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-3.5 text-sm focus:outline-none"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
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
                    'Register Teacher'
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
