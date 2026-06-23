'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2, FileText, Download, Trash2, Eye, X, BookOpen } from 'lucide-react';
import { Note } from '@/types';

export default function NotesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State variables
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  
  // Upload note state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [uploadBatch, setUploadBatch] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const isStudent = user?.role === 'student';

  // Fetch batches list
  const { data: batchesData } = useQuery({
    queryKey: ['batchesList'],
    queryFn: async () => {
      const endpoint = user?.role === 'teacher' ? '/batches/my-batches' : '/batches';
      const res = await api.get(endpoint);
      return Array.isArray(res.data.data) ? res.data.data : (res.data.data.items || []);
    },
  });

  // Fetch notes
  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', selectedBatch, search],
    queryFn: async () => {
      const params: any = {};
      if (isStudent && typeof user.batch === 'object' && user.batch !== null) {
        params.batchId = (user.batch as any)._id;
      } else if (isStudent && typeof user.batch === 'string') {
        params.batchId = user.batch;
      } else if (selectedBatch) {
        params.batchId = selectedBatch;
      }

      if (search.trim()) {
        params.subject = search.trim();
      }

      const res = await api.get('/notes', { params });
      return res.data.data.items || [];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setModalOpen(false);
      resetForm();
      alert('Note uploaded successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'File upload failed');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await api.delete(`/notes/${noteId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      alert('Note deleted successfully!');
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setUploadBatch('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !uploadBatch) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject', subject);
    formData.append('batchId', uploadBatch);
    formData.append('file', file);

    uploadMutation.mutate(formData);
  };

  const handleDelete = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteMutation.mutate(noteId);
    }
  };

  const list = notesData || [];
  const canUpload = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Notes Library</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isStudent ? 'Download homework assignments, syllabus notes, and formulas.' : 'Upload study materials, homework, and syllabus sheets for your batches.'}
          </p>
        </div>
        
        {canUpload && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            <Plus className="h-5 w-5" />
            <span>Upload Notes</span>
          </button>
        )}
      </div>

      {/* Filters (Search subject / Select Batch) */}
      {!isStudent && (
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes by subject name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            />
          </div>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
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
      )}

      {/* Notes Grid */}
      {notesLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : list.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((note: any) => (
            <div
              key={note._id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full select-none capitalize">
                    {note.subject}
                  </span>
                  <span className="text-xs text-slate-450 font-medium">
                    {new Date(note.uploadedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{note.title}</span>
                </h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{note.description}</p>
                <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-450 truncate">
                  File: {note.fileName}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white hover:underline"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Resource</span>
                </a>
                
                {canUpload && (
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-16 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl">No notes study resources uploaded yet.</div>
      )}

      {/* UPLOAD NOTES MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-bold">Upload Resource</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Note Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white"
                  placeholder="e.g. Chapter 3 Calculus Formulas"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                  placeholder="Summary of notes or student tasks"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Target Batch</label>
                  <select
                    required
                    value={uploadBatch}
                    onChange={(e) => setUploadBatch(e.target.value)}
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-555 uppercase mb-1.5">Select File (PDF, DOCX, Images)</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
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
                  disabled={uploadMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm transition-all disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Upload File'
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
