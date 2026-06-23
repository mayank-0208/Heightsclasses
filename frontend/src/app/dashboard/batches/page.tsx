'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, Calendar, User, Eye, X, BookOpen } from 'lucide-react';
import { Batch } from '@/types';

export default function BatchesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [assignedTeacher, setAssignedTeacher] = useState('');

  // Fetch batches
  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches', search],
    queryFn: async () => {
      const endpoint = user?.role === 'teacher' ? '/batches/my-batches' : '/batches';
      const res = await api.get(endpoint);
      
      // Teacher endpoint returns array directly, admin returns paginated items object
      const items = Array.isArray(res.data.data) ? res.data.data : (res.data.data.items || []);
      
      if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        return items.filter(
          (b: Batch) =>
            b.batchName.toLowerCase().includes(lowerSearch) ||
            b.description.toLowerCase().includes(lowerSearch)
        );
      }
      return items;
    },
  });

  // Fetch teachers for dropdown selection (Admin only)
  const { data: teachersData } = useQuery({
    queryKey: ['teachersList'],
    enabled: user?.role === 'admin',
    queryFn: async () => {
      const res = await api.get('/auth/users', { params: { role: 'teacher' } });
      return res.data.data.items || [];
    },
  });

  // Create Batch Mutation
  const createBatchMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/batches', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setBatchName('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setAssignedTeacher('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTeacher) return;

    createBatchMutation.mutate({
      batchName,
      description,
      startDate,
      endDate,
      assignedTeacher,
    });
  };

  const isAdmin = user?.role === 'admin';
  const list = batchesData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches & Courses</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Manage academic sessions, descriptions, and assign teachers to courses.' : 'View your assigned classes and course details.'}
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            <Plus className="h-5 w-5" />
            <span>Create Batch</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="relative bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by batch name or course description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
        />
      </div>

      {/* Batches Cards Grid */}
      {batchesLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : list.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((batch: any) => (
            <div
              key={batch._id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    batch.isActive 
                      ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                      : 'bg-slate-100 text-slate-650'
                  }`}>
                    {batch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{batch.batchName}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{batch.description}</p>
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-550">
                  <User className="h-4 w-4" />
                  <span>Teacher: <strong className="text-slate-700 dark:text-slate-300">
                    {typeof batch.assignedTeacher === 'object' && batch.assignedTeacher !== null
                      ? (batch.assignedTeacher as any).fullName
                      : 'Unassigned'}
                  </strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-550">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-16">No batches found matching current filters.</div>
      )}

      {/* CREATE BATCH MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-bold">Create New Batch</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Batch Name</label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white"
                  placeholder="e.g. Physics Class 11"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Course Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  placeholder="Syllabus overview and schedules"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-1.5">Assign Instructor / Teacher</label>
                <select
                  required
                  value={assignedTeacher}
                  onChange={(e) => setAssignedTeacher(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                >
                  <option value="">Select a teacher...</option>
                  {teachersData?.map((t: any) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} ({t.email})
                    </option>
                  ))}
                </select>
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
                  disabled={createBatchMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm transition-all disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  {createBatchMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Create Batch'
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
