'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Megaphone, Calendar, User, Eye, Trash2, X, Plus, Check } from 'lucide-react';
import { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  
  // Create state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetBatch, setTargetBatch] = useState('');

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  // Fetch announcements
  const { data: announcementsData = [], isLoading: listLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await api.get('/announcements');
      return res.data.data?.items || res.data.data || [];
    },
  });

  // Fetch batches for selection (Admin only)
  const { data: batchesData } = useQuery({
    queryKey: ['batchesList'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get('/batches');
      return Array.isArray(res.data.data) ? res.data.data : (res.data.data.items || []);
    },
  });

  // Create notice mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/announcements', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setModalOpen(false);
      resetForm();
      alert('Announcement posted successfully!');
    },
  });

  // Delete notice mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/announcements/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      alert('Announcement deleted successfully!');
    },
  });

  // Mark as read mutation
  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/announcements/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTargetBatch('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      content,
      targetBatch: targetBatch || undefined,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      deleteMutation.mutate(id);
    }
  };

  const list = announcementsData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Publish announcements and notices targeted to specific batches.' : 'Read announcements and notices published by administration.'}
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            <Plus className="h-5 w-5" />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Announcements Timeline List */}
      {listLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : list.length > 0 ? (
        <div className="space-y-6 max-w-3xl">
          {list.map((notice: any) => {
            const hasRead = isStudent && notice.readBy?.includes(user?._id);
            return (
              <div
                key={notice._id}
                className={`relative rounded-2xl border bg-white p-6 shadow-xs dark:bg-slate-900 transition-colors duration-200 ${
                  isStudent && !hasRead
                    ? 'border-blue-500 dark:border-blue-400/55 bg-blue-50/10 dark:bg-blue-950/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-350">
                      <User className="h-4 w-4" />
                      {notice.createdBy?.fullName || 'System Administrator'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(notice.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold uppercase tracking-wider dark:bg-slate-800">
                      {notice.targetBatch?.batchName || 'All Students'}
                    </span>
                    {isStudent && !hasRead && (
                      <span className="rounded-full bg-blue-500 px-2.5 py-0.5 text-white font-bold uppercase tracking-wider select-none animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  {notice.title}
                </h3>
                <p className="mt-3 text-sm text-slate-655 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>

                {/* Footnotes & Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div>
                    {isStudent && !hasRead && (
                      <button
                        onClick={() => readMutation.mutate(notice._id)}
                        disabled={readMutation.isPending}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>Mark as Read</span>
                      </button>
                    )}
                    {isStudent && hasRead && (
                      <span className="text-xs text-slate-450 italic flex items-center gap-1">
                        <Check className="h-4 w-4 text-emerald-500" /> Read notice
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-16 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl">No active announcements posted.</div>
      )}

      {/* POST ANNOUNCEMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-bold">Publish New Notice</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white"
                  placeholder="e.g. Schedule Update or Exam Notice"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Target Audience (Course/Batch)</label>
                <select
                  value={targetBatch}
                  onChange={(e) => setTargetBatch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                >
                  <option value="">Broadcast to All Students</option>
                  {batchesData?.map((b: any) => (
                    <option key={b._id} value={b._id}>
                      Only {b.batchName} Enrollees
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Detailed Content</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  placeholder="Enter notice context and instructions..."
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
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm transition-all disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Publish Notice'
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
