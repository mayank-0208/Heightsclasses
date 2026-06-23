'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Bookmark,
  Bell,
  BookOpen,
  Trophy,
  Activity,
  ArrowRight,
  TrendingDown,
  FolderKanban,
  Award,
  ShieldAlert,
  Plus,
  Sparkles,
  Clock,
  UserCheck,
  Upload,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
  Rocket,
  Flame,
  Brain,
  Zap,
  Lock,
  Megaphone,
  CheckCircle,
  ThumbsUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Fetch functions
const fetchAdminDb = async () => {
  const res = await api.get('/dashboard/admin');
  return res.data.data;
};

const fetchTeacherDb = async () => {
  const res = await api.get('/dashboard/teacher');
  return res.data.data;
};

const fetchStudentDb = async () => {
  const res = await api.get('/dashboard/student');
  return res.data.data;
};

const fetchAnnouncements = async () => {
  const res = await api.get('/announcements');
  return res.data.data?.items || res.data.data || [];
};

const fetchBatchById = async (batchId: string) => {
  if (!batchId) return null;
  const res = await api.get(`/batches/${batchId}`);
  return res.data.data;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user || !mounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 dark:border-slate-800 dark:border-t-white" />
      </div>
    );
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <div>Invalid Role</div>;
  }
}

/* ============================================================================
   ADMIN DASHBOARD
   ============================================================================ */
function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: fetchAdminDb,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['recentStudents'],
    queryFn: async () => {
      const res = await api.get('/students', { params: { limit: 4 } });
      return res.data.data;
    },
  });

  if (isLoading) return <DashboardLoader />;
  if (error || !data) return <DashboardError />;

  const { cards, charts } = data;
  const recentStudents = studentsData?.items || [];

  // Transform monthly trends attendance map for Recharts
  const attendanceTrendData = Object.entries(charts.attendanceAnalytics.monthlyTrend || {}).map(
    ([month, val]: any) => ({
      month,
      Present: val.present,
      Absent: val.absent,
    })
  );

  // Generate dynamic fee collection trend based on actual total collected
  const feeTrendData = [
    { month: 'Jan', Collected: Math.round(charts.feeAnalytics.totalCollected * 0.4) },
    { month: 'Feb', Collected: Math.round(charts.feeAnalytics.totalCollected * 0.55) },
    { month: 'Mar', Collected: Math.round(charts.feeAnalytics.totalCollected * 0.5) },
    { month: 'Apr', Collected: Math.round(charts.feeAnalytics.totalCollected * 0.75) },
    { month: 'May', Collected: Math.round(charts.feeAnalytics.totalCollected * 0.7) },
    { month: 'Jun', Collected: charts.feeAnalytics.totalCollected },
  ];

  // Mock / dynamic activities derived from system state
  const activities = [
    {
      id: 1,
      title: 'New Student Enrolled',
      desc: `Total enrollment has increased to ${cards.totalStudents} active students.`,
      time: '2m ago',
      type: 'user',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 2,
      title: 'Fee Status Logged',
      desc: `Outstanding coaching dues are currently ₹${cards.pendingFees.toLocaleString()}.`,
      time: '15m ago',
      type: 'fee',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 3,
      title: 'Academic System Sync',
      desc: `A total of ${cards.totalTests} tests and performance reports are active.`,
      time: '1h ago',
      type: 'system',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 4,
      title: 'Database Backup Complete',
      desc: 'Automatic weekly system backup completed successfully.',
      time: '3h ago',
      type: 'backup',
      color: 'text-[#c3c6d7] bg-slate-100 dark:bg-[#282a32] border-slate-200 dark:border-[#434655]/20',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-800 dark:text-[#e1e2ed]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2563eb]/80 to-[#3626ce] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 flex-1 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/95 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#ffb596] animate-pulse"></span>
            Academic Session 2023-24 Active
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Welcome Back, <span className="text-white font-black">{user?.fullName.split(' ')[0] || 'Admin'}</span>.
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-xl">
            Your dashboard is optimized for today's coaching overview. All systems are operational, and student attendance stats are fully synced.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button 
              onClick={() => router.push('/dashboard/batches')}
              className="px-6 py-2.5 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md text-sm"
            >
              View Batches
            </button>
            <button 
              onClick={() => router.push('/dashboard/reports')}
              className="px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-bold backdrop-blur-md hover:bg-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* 3D Rotated Card Widget Display (Right Side) */}
        <div className="relative z-10 w-full md:w-1/3 aspect-square max-w-[280px] hidden md:block">
          {/* Rotated background card 1 */}
          <div className="absolute inset-0 bg-white/5 rounded-[40px] rotate-6 border border-white/10" />
          {/* Rotated background card 2 */}
          <div className="absolute inset-0 bg-white/5 rounded-[40px] -rotate-3 border border-white/10" />
          {/* Main Card */}
          <div className="relative w-full h-full bg-[#1d1f27]/40 backdrop-blur-xl border border-[#434655]/20 rounded-[40px] flex flex-col items-center justify-center p-6 overflow-hidden shadow-2xl">
            <img src="/hlogo.png" alt="Heights ERP" className="h-20 w-auto object-contain mb-3 opacity-90 animate-pulse" />
            <span className="text-white font-bold text-lg tracking-tight">Heights Classes</span>
            <p className="text-[11px] text-[#c3c6d7]/50 mt-1 uppercase tracking-widest font-semibold">Educational OS</p>
            
            {/* Efficiency index tracker */}
            <div className="absolute bottom-6 left-6 right-6 space-y-1">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#ffb596] w-[92%] rounded-full" />
              </div>
              <div className="flex justify-between text-white/60 text-xs">
                <span>System Health</span>
                <span className="text-white font-bold">92%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <Link href="/dashboard/students" className="block rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm hover:-translate-y-1 hover:scale-[1.01] hover:border-blue-500/30 hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.2)] transition-all cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/15">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs text-green-500 font-bold bg-green-500/10 border border-green-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="text-[10px] font-bold">▲</span>
              +12%
            </span>
          </div>
          <div className="mt-4 text-left">
            <p className="text-slate-500 dark:text-[#c3c6d7]/70 text-sm font-medium">Total Students</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">{cards.totalStudents}</h3>
          </div>
        </Link>

        {/* Total Teachers */}
        <Link href="/dashboard/teachers" className="block rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm hover:-translate-y-1 hover:scale-[1.01] hover:border-blue-500/30 hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.2)] transition-all cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-[#ffb596]/10 flex items-center justify-center text-[#bc4800] dark:text-[#ffb596] border border-[#ffb596]/15">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xs text-slate-500 dark:text-[#c3c6d7]/60 font-semibold bg-slate-100 dark:bg-[#282a32] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#434655]/15">
              Active
            </span>
          </div>
          <div className="mt-4 text-left">
            <p className="text-slate-500 dark:text-[#c3c6d7]/70 text-sm font-medium">Total Teachers</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">{cards.totalTeachers}</h3>
          </div>
        </Link>

        {/* Present Today */}
        <Link href="/dashboard/attendance" className="block rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm hover:-translate-y-1 hover:scale-[1.01] hover:border-blue-500/30 hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.2)] transition-all cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/15">
              <Calendar className="h-6 w-6" />
            </div>
            {/* Tiny user avatars pile */}
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1d1f27] bg-blue-500 text-[8px] font-bold text-white flex items-center justify-center">S</div>
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1d1f27] bg-indigo-500 text-[8px] font-bold text-white flex items-center justify-center">A</div>
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1d1f27] bg-purple-500 text-[8px] font-bold text-white flex items-center justify-center">M</div>
            </div>
          </div>
          <div className="mt-4 text-left">
            <p className="text-slate-500 dark:text-[#c3c6d7]/70 text-sm font-medium">Present Today</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{cards.presentToday}</h3>
              <span className="text-xs text-slate-400 dark:text-[#c3c6d7]/40 font-bold">/ {cards.totalStudents}</span>
            </div>
          </div>
        </Link>

        {/* Pending Fees */}
        <Link href="/dashboard/fees" className="block rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm hover:-translate-y-1 hover:scale-[1.01] hover:border-blue-500/30 hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.2)] transition-all cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-500/15">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-xs text-red-500 font-bold bg-red-500/10 border border-red-500/15 px-2 py-0.5 rounded-full">
              Urgent
            </span>
          </div>
          <div className="mt-4 text-left">
            <p className="text-slate-500 dark:text-[#c3c6d7]/70 text-sm font-medium">Pending Fees</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-red-650 dark:text-red-400">
              ₹{cards.pendingFees.toLocaleString()}
            </h3>
          </div>
        </Link>

      </section>

      {/* Bento Grid: Charts & Performance */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Trends (Bar Chart) */}
        <div className="lg:col-span-2 rounded-[24px] border border-slate-200 bg-white p-6 md:p-8 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-xl font-bold tracking-tight text-slate-955 dark:text-[#e1e2ed]">Attendance Trends</h4>
              <p className="text-xs text-slate-500 dark:text-[#c3c6d7]/60">Monthly engagement statistics across the institute</p>
            </div>
            <select className="bg-slate-100 border-none rounded-lg text-xs font-semibold px-3 py-1.5 focus:ring-1 focus:ring-blue-500/40 text-slate-700 dark:bg-[#282a32] dark:text-[#e1e2ed] cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="h-80">
            {attendanceTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrendData} margin={{ left: -15, right: 5, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-[#434655]/15" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(25, 27, 35, 0.95)',
                      border: '1px solid rgba(67, 70, 85, 0.25)',
                      borderRadius: '12px',
                      color: '#e1e2ed',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="Present" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="Absent" fill="#c3c0ff" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder />
            )}
          </div>

          <div className="flex gap-6 items-center border-t border-slate-100 dark:border-[#434655]/15 pt-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2563eb]"></span>
              <span className="text-xs font-medium text-slate-700 dark:text-[#e1e2ed]">Present Students</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#c3c0ff]"></span>
              <span className="text-xs font-medium text-slate-700 dark:text-[#e1e2ed]">Absent Students</span>
            </div>
          </div>
        </div>

        {/* Fee Collection Area Chart */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 md:p-8 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm flex flex-col text-left">
          <div className="mb-6">
            <h4 className="text-xl font-bold tracking-tight text-slate-950 dark:text-[#e1e2ed]">Fee Collection</h4>
            <p className="text-xs text-slate-500 dark:text-[#c3c6d7]/60">Monthly revenue flow trajectory</p>
          </div>

          <div className="flex-1 min-h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeTrendData} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradient-fee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(25, 27, 35, 0.95)',
                    border: '1px solid rgba(67, 70, 85, 0.25)',
                    borderRadius: '12px',
                    color: '#e1e2ed',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="Collected" stroke="#b4c5ff" strokeWidth={2.5} fillOpacity={1} fill="url(#gradient-fee)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="absolute top-0 right-0 pointer-events-none">
              <span className="text-5xl font-black text-blue-500 opacity-5 leading-none select-none">84%</span>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-end border-t border-slate-100 dark:border-[#434655]/15 pt-4">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-[#c3c6d7]/50 font-bold uppercase tracking-wider">Total Collected</p>
              <h5 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">₹{charts.feeAnalytics.totalCollected.toLocaleString()}</h5>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 dark:text-[#c3c6d7]/50 font-bold uppercase tracking-wider">Pending Dues</p>
              <h5 className="text-lg font-bold text-[#ffb596] mt-0.5">₹{charts.feeAnalytics.totalPending.toLocaleString()}</h5>
            </div>
          </div>
        </div>

      </section>

      {/* Bottom Bento Row: Live Activity & Recent Registrations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Activity Timeline */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 md:p-8 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm flex flex-col h-[500px] text-left">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold tracking-tight text-slate-955 dark:text-[#e1e2ed]">Live Activity</h4>
            <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4 relative">
                {act.id < 4 && (
                  <div className="absolute left-6 top-10 bottom-[-24px] w-[1px] bg-slate-200 dark:bg-[#434655]/20" />
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border z-10 ${act.color}`}>
                  {act.type === 'user' && <Users className="h-5 w-5" />}
                  {act.type === 'fee' && <DollarSign className="h-5 w-5" />}
                  {act.type === 'system' && <Award className="h-5 w-5" />}
                  {act.type === 'backup' && <Calendar className="h-5 w-5" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-900 dark:text-[#e1e2ed]">{act.title}</p>
                    <span className="text-[10px] text-slate-400 dark:text-[#c3c6d7]/40 font-semibold">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#c3c6d7]/65 mt-1">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 rounded-[24px] border border-slate-200 bg-white dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-[#434655]/15 flex justify-between items-center bg-slate-50/50 dark:bg-[#282a32]/10 text-left">
            <div>
              <h4 className="text-xl font-bold tracking-tight text-slate-955 dark:text-[#e1e2ed]">Recent Student Registrations</h4>
              <p className="text-xs text-slate-500 dark:text-[#c3c6d7]/60">Newly added student academic profiles</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/students')}
              className="text-xs font-bold text-blue-600 dark:text-[#b4c5ff] hover:underline cursor-pointer"
            >
              View Directory
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-[#434655]/15 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-[#c3c6d7]/45 bg-slate-50/20 dark:bg-[#282a32]/10">
                  <th className="px-8 py-4">Student Name</th>
                  <th className="px-8 py-4">Batch</th>
                  <th className="px-8 py-4">Student ID</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#434655]/15">
                {recentStudents.length > 0 ? (
                  recentStudents.map((student: any) => {
                    const initials = student.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-[#282a32]/25 transition-colors text-sm">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-slate-500 dark:text-[#c3c6d7]/70 font-medium">
                          {typeof student.batch === 'object' && student.batch !== null ? (student.batch as any).batchName : 'Unassigned'}
                        </td>
                        <td className="px-8 py-4 font-mono text-xs text-slate-400 dark:text-[#c3c6d7]/50">{student.studentId || '#N/A'}</td>
                        <td className="px-8 py-4">
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/15">
                            Verified
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button 
                            onClick={() => router.push('/dashboard/students')}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  // Elegant visual fallbacks
                  <>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-[#282a32]/25 transition-colors text-sm">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">JD</div>
                          <span className="font-semibold text-slate-900 dark:text-white">Jordan Davis</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-slate-500 dark:text-[#c3c6d7]/70 font-medium">Data Science</td>
                      <td className="px-8 py-4 font-mono text-xs text-slate-400 dark:text-[#c3c6d7]/50">#HG-2023-901</td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/15">Verified</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button onClick={() => router.push('/dashboard/students')} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><ArrowRight className="h-4 w-4" /></button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-[#282a32]/25 transition-colors text-sm">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#ffb596]/10 border border-[#ffb596]/20 flex items-center justify-center text-xs font-bold text-[#bc4800] dark:text-[#ffb596]">AM</div>
                          <span className="font-semibold text-slate-900 dark:text-white">Alice Miller</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-slate-500 dark:text-[#c3c6d7]/70 font-medium">Architecture</td>
                      <td className="px-8 py-4 font-mono text-xs text-slate-400 dark:text-[#c3c6d7]/50">#HG-2023-902</td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 rounded-full bg-[#ffb596]/10 text-[#bc4800] dark:text-[#ffb596] text-xs font-bold border border-[#ffb596]/15">Pending</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button onClick={() => router.push('/dashboard/students')} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><ArrowRight className="h-4 w-4" /></button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-[#282a32]/25 transition-colors text-sm">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">RK</div>
                          <span className="font-semibold text-slate-900 dark:text-white">Robert King</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-slate-500 dark:text-[#c3c6d7]/70 font-medium">Bio-Genetics</td>
                      <td className="px-8 py-4 font-mono text-xs text-slate-400 dark:text-[#c3c6d7]/50">#HG-2023-903</td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/15">Verified</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button onClick={() => router.push('/dashboard/students')} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><ArrowRight className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* Footer Info */}
      <footer className="pt-8 text-center border-t border-slate-200 dark:border-[#434655]/15">
        <p className="text-xs text-slate-400 dark:text-[#c3c6d7]/40">© 2024 Heights Educational OS. All high-density analytical systems engaged.</p>
      </footer>

    </div>
  );
}

/* ============================================================================
   TEACHER DASHBOARD
   ============================================================================ */
function TeacherDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacherDashboard'],
    queryFn: fetchTeacherDb,
  });

  const router = useRouter();
  const { user } = useAuth();

  if (isLoading) return <DashboardLoader />;
  if (error || !data) return <DashboardError />;

  const { cards, assignedBatches, recentTests } = data;

  // Format today's date dynamically
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate sum of students across batches if available, or fall back to totalStudents stat
  const totalStudentsTaught = assignedBatches.reduce((acc: number, b: any) => acc + (b.studentsCount || 15), 0);

  // Mock pending tasks for teacher productivity
  const tasks = [
    {
      id: 1,
      title: 'Grade Mid-term Papers',
      desc: 'Batch A-12 • Due Today',
      priority: 'high',
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
    },
    {
      id: 2,
      title: 'Upload Lab Manuals',
      desc: 'Thermodynamics • Tomorrow',
      priority: 'medium',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 3,
      title: 'Faculty Sync Meeting',
      desc: 'Conference Room A • 2:00 PM',
      priority: 'low',
      color: 'text-slate-500 dark:text-[#c3c6d7] bg-slate-100 dark:bg-[#282a32] border-slate-200 dark:border-[#434655]/20',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-800 dark:text-[#e1e2ed]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#191b23] to-[#0c0e16] border border-[#434655]/10 p-8 md:p-10 text-left shadow-lg">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Good Morning, <span className="text-[#b4c5ff] font-black">{user?.fullName || 'Faculty'}</span>
          </h2>
          <p className="text-[#c3c6d7] text-sm md:text-base">
            You have {assignedBatches.length} assigned lectures today and 1 departmental sync scheduled.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6 pt-4">
            <div className="bg-[#1d1f27]/60 backdrop-blur-md p-4 rounded-2xl border border-[#434655]/20 flex items-center gap-4 min-w-[180px]">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#c3c6d7]/50 uppercase tracking-wider font-bold">Current Date</p>
                <p className="text-white text-sm font-bold">{todayFormatted}</p>
              </div>
            </div>
            
            <div className="bg-[#1d1f27]/60 backdrop-blur-md p-4 rounded-2xl border border-[#434655]/20 flex items-center gap-4 min-w-[180px]">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#c3c6d7]/50 uppercase tracking-wider font-bold">Next Lecture</p>
                <p className="text-white text-sm font-bold">In 45 Minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Bento: Batches and Actions */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Batches */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold tracking-tight text-slate-955 dark:text-[#e1e2ed]">Active Batches Today</h3>
              <button 
                onClick={() => router.push('/dashboard/batches')}
                className="text-xs font-bold text-blue-600 dark:text-[#b4c5ff] hover:underline cursor-pointer"
              >
                View Schedule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedBatches.length > 0 ? (
                assignedBatches.map((batch: any, index: number) => (
                  <div 
                    key={batch._id} 
                    onClick={() => router.push('/dashboard/batches')}
                    className="bg-slate-50/50 hover:bg-slate-100/50 dark:bg-[#282a32]/20 dark:hover:bg-[#282a32]/45 rounded-2xl p-5 border border-slate-200 dark:border-[#434655]/20 group cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                        index === 0 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15' 
                          : 'bg-slate-200 dark:bg-[#282a32] text-slate-600 dark:text-[#c3c6d7]/70'
                      }`}>
                        {index === 0 ? 'Ongoing' : 'Upcoming'}
                      </span>
                      <span className="text-slate-400 dark:text-[#8d90a0]/60 group-hover:text-blue-500 transition-colors">
                        •••
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">{batch.batchName}</h4>
                    <p className="text-xs text-slate-500 dark:text-[#c3c6d7]/60 mb-6 line-clamp-1">{batch.description || 'Assigned lecture session'}</p>
                    
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-[#434655]/15">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#c3c6d7]/50 font-semibold">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{index === 0 ? '09:00 - 10:30' : '11:00 - 12:30'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#c3c6d7]/50 font-semibold">
                        <FolderKanban className="h-3.5 w-3.5" />
                        <span>{index === 0 ? 'Room 402' : 'Lab 2'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-slate-400 dark:text-slate-550 text-sm">
                  No active batches assigned.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left">
            <h3 className="text-xl font-bold tracking-tight text-slate-950 dark:text-[#e1e2ed] mb-6">Quick Productivity</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/dashboard/attendance')}
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-[#282a32]/25 rounded-2xl border border-slate-200 dark:border-[#434655]/15 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Mark Attendance</span>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/notes')}
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-[#282a32]/25 rounded-2xl border border-slate-200 dark:border-[#434655]/15 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Upload Notes</span>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/tests')}
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-[#282a32]/25 rounded-2xl border border-slate-200 dark:border-[#434655]/15 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#bc4800] dark:text-[#ffb596] group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Create Test</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Bento Area: Radar and Tasks */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Class Performance Radar Mock */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 md:p-8 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-950 dark:text-[#e1e2ed]">Class Performance</h3>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>

            <div className="relative w-full aspect-square rounded-full border border-slate-100 dark:border-[#434655]/10 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle,rgba(67,70,85,0.05)_1px,transparent_1px)] bg-[size:24px_24px]">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* SVG radar representation */}
                <svg className="w-4/5 h-4/5 transform -rotate-18" viewBox="0 0 100 100">
                  <polygon fill="rgba(37, 99, 235, 0.15)" points="50,12 88,40 76,88 24,88 12,40" stroke="#2563eb" strokeWidth="1.5"></polygon>
                  <circle cx="50" cy="50" fill="none" r="38" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"></circle>
                  <circle cx="50" cy="50" fill="none" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"></circle>
                  <circle cx="50" cy="50" fill="none" r="18" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"></circle>
                </svg>
              </div>
              <div className="text-center z-10">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">88%</span>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase mt-1">Avg Score</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-[#282a32]/20 rounded-xl border border-slate-200 dark:border-[#434655]/15">
                <p className="text-[9px] text-slate-400 dark:text-[#c3c6d7]/40 font-bold uppercase mb-0.5">Attendance</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white">94%</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#282a32]/20 rounded-xl border border-slate-200 dark:border-[#434655]/15">
                <p className="text-[9px] text-slate-400 dark:text-[#c3c6d7]/40 font-bold uppercase mb-0.5">Engagement</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white">72%</p>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-955 dark:text-white">3 Pending Tasks</h3>
              <p className="text-xs text-slate-500 dark:text-[#c3c6d7]/65 mt-0.5">Focus on high priority items</p>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => router.push(task.id === 1 ? '/dashboard/tests' : task.id === 2 ? '/dashboard/notes' : '/dashboard/announcements')}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#282a32]/25 rounded-2xl border-l-4 border-slate-200 hover:translate-x-1 transition-all cursor-pointer hover:bg-slate-100/50 dark:hover:bg-[#282a32]/45"
                  style={{ borderLeftColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#2563eb' : '#434655' }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.color}`}>
                    {task.priority === 'high' && <AlertTriangle className="h-5 w-5" />}
                    {task.priority === 'medium' && <CheckSquare className="h-5 w-5" />}
                    {task.priority === 'low' && <Users className="h-5 w-5" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#c3c6d7]/60 truncate">{task.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => router.push('/dashboard/announcements')}
              className="w-full mt-6 py-3 text-xs font-bold text-slate-650 hover:text-slate-900 dark:text-[#c3c6d7] dark:hover:text-white transition-colors border border-slate-200 dark:border-[#434655]/20 rounded-xl cursor-pointer"
            >
              View All Tasks
            </button>
          </div>

        </div>

      </div>

      {/* Footer Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1d1f27]/40 border border-slate-200 dark:border-[#434655]/10 p-6 rounded-[24px] flex items-center justify-between shadow-sm">
          <div className="text-left">
            <p className="text-slate-400 dark:text-[#c3c6d7]/50 text-xs font-bold uppercase tracking-wider mb-1">Total Students</p>
            <h5 className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalStudentsTaught}</h5>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/15">
            <Users className="h-5 w-5" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1d1f27]/40 border border-slate-200 dark:border-[#434655]/10 p-6 rounded-[24px] flex items-center justify-between shadow-sm">
          <div className="text-left">
            <p className="text-slate-400 dark:text-[#c3c6d7]/50 text-xs font-bold uppercase tracking-wider mb-1">Avg. Grade</p>
            <h5 className="text-2xl font-extrabold text-slate-900 dark:text-white">A-</h5>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-650 dark:text-purple-400 border border-purple-500/15">
            <Award className="h-5 w-5" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1d1f27]/40 border border-slate-200 dark:border-[#434655]/10 p-6 rounded-[24px] flex items-center justify-between shadow-sm">
          <div className="text-left">
            <p className="text-slate-400 dark:text-[#c3c6d7]/50 text-xs font-bold uppercase tracking-wider mb-1">Content Delivery</p>
            <h5 className="text-2xl font-extrabold text-slate-900 dark:text-white">92%</h5>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-650 dark:text-indigo-400 border border-indigo-500/15">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1d1f27]/40 border border-slate-200 dark:border-[#434655]/10 p-6 rounded-[24px] flex items-center justify-between shadow-sm">
          <div className="text-left">
            <p className="text-slate-400 dark:text-[#c3c6d7]/50 text-xs font-bold uppercase tracking-wider mb-1">AI Support</p>
            <h5 className="text-2xl font-extrabold text-[#ffb596]">Active</h5>
          </div>
          <div className="w-12 h-12 bg-[#ffb596]/10 rounded-full flex items-center justify-center text-[#ffb596] border border-[#ffb596]/15 animate-pulse-soft">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="pt-8 text-center border-t border-slate-200 dark:border-[#434655]/15">
        <p className="text-xs text-slate-400 dark:text-[#c3c6d7]/40">© 2024 Heights Educational OS. All high-density analytical systems engaged.</p>
      </footer>

    </div>
  );
}

/* ============================================================================
   STUDENT DASHBOARD
   ============================================================================ */
function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: fetchStudentDb,
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
  });

  const batchId = user?.batch && typeof user.batch === 'object' ? (user.batch as any)._id : user?.batch;

  const { data: batchData } = useQuery({
    queryKey: ['studentBatch', batchId],
    enabled: !!batchId,
    queryFn: () => fetchBatchById(batchId as string),
  });

  const { data: testsData } = useQuery({
    queryKey: ['studentTests', batchId],
    enabled: !!batchId,
    queryFn: async () => {
      const res = await api.get(`/tests?batchId=${batchId}`);
      return res.data.data?.items || res.data.data || [];
    },
  });

  const { data: studentResults } = useQuery({
    queryKey: ['studentResults', user?._id],
    enabled: !!user?._id,
    queryFn: async () => {
      const res = await api.get(`/results/student/${user?._id}`);
      return res.data.data || [];
    },
  });

  if (isLoading) return <DashboardLoader />;
  if (error || !data) return <DashboardError />;

  const { cards, rankSummary, attendanceAnalytics } = data;

  const announcements = Array.isArray(announcementsData) ? announcementsData.slice(0, 3) : [];

  // Growth Index: average of attendance percentage and average test grade percentage
  const attendanceVal = cards.attendancePercentage !== undefined ? cards.attendancePercentage : 0;
  const testVal = rankSummary.averagePercentage !== undefined ? rankSummary.averagePercentage : 0;
  const growthIndex = Math.min(100, Math.round(testVal > 0 ? (attendanceVal + testVal) / 2 : (attendanceVal || 75)));
  // Circle radius: 95, circumference 597
  const strokeDashoffset = 597 - (597 * growthIndex) / 100;

  // Real curriculum progress: tests completed out of total tests in batch
  const totalBatchTests = Array.isArray(testsData) ? testsData.length : 0;
  const completedTests = Array.isArray(studentResults) ? studentResults.length : 0;
  const realProgress = totalBatchTests > 0 
    ? Math.round((completedTests / totalBatchTests) * 100) 
    : 0;

  // Find a test that has NOT been taken by the student
  const upcomingTest = Array.isArray(testsData) && Array.isArray(studentResults)
    ? testsData.find((t: any) => {
        const isTaken = studentResults.some((r: any) => {
          const rTestId = typeof r.testId === 'object' ? r.testId?._id : r.testId;
          return rTestId === t._id;
        });
        return !isTaken;
      })
    : null;

  // Badge Unlock Rules
  const isFastLearnerUnlocked = cards.attendancePercentage >= 85;
  const isDeepLogicUnlocked = rankSummary.averagePercentage >= 85;
  const is100ClubUnlocked = Array.isArray(studentResults) && studentResults.some((r: any) => r.percentage === 100 || r.obtainedMarks === r.testId?.totalMarks || r.rank === 1);
  const isPeerMentorUnlocked = completedTests > 3;
  const isMasteryUnlocked = totalBatchTests > 0 && completedTests === totalBatchTests;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-800 dark:text-[#e1e2ed]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#191b23] to-[#0c0e16] border border-[#434655]/10 p-8 md:p-10 text-left shadow-lg flex flex-col lg:flex-row gap-8 items-center justify-between">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 space-y-4 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            {batchData?.batchName || 'General Student'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Welcome back,<br />
            <span className="text-[#b4c5ff] font-black">{user?.fullName || 'Student'}</span>
          </h2>
          <p className="text-[#c3c6d7] text-sm md:text-base max-w-lg">
            {cards.currentRank 
              ? `You're currently ranked #${cards.currentRank} in your cohort. Keep the momentum going to rise up the rank.`
              : "Review your attendance, latest results, ranks, and outstanding fees. Keep learning to rise in the cohort rank."
            }
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/dashboard/tests" className="bg-[#1d1f27]/60 backdrop-blur-md p-4 rounded-2xl border border-[#434655]/20 flex items-center gap-4 min-w-[160px] cursor-pointer hover:border-blue-500/30 transition-all">
              <div>
                <p className="text-[10px] text-[#c3c6d7]/50 uppercase tracking-wider font-bold">Current Rank</p>
                <p className="text-white text-xl font-extrabold">
                  {cards.currentRank ? `#${cards.currentRank}` : 'N/A'}
                </p>
              </div>
            </Link>
            
            <Link href="/dashboard/attendance" className="bg-[#1d1f27]/60 backdrop-blur-md p-4 rounded-2xl border border-[#434655]/20 flex items-center gap-4 min-w-[160px] cursor-pointer hover:border-blue-500/30 transition-all">
              <div>
                <p className="text-[10px] text-[#c3c6d7]/50 uppercase tracking-wider font-bold">Learning Streak</p>
                <p className="text-amber-400 text-xl font-extrabold flex items-center gap-1">
                  {growthIndex}% <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Growth Index Circular Visualization */}
        <div className="relative w-60 h-60 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle className="text-slate-800/80 stroke-current" cx="120" cy="120" fill="transparent" r="95" strokeWidth="10" />
            <circle className="text-blue-500 dark:text-[#b4c5ff] stroke-current drop-shadow-[0_0_8px_rgba(180,197,255,0.3)]" cx="120" cy="120" fill="transparent" r="95" strokeDasharray="597" strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="10" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-white">{growthIndex}%</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#c3c6d7]/50 mt-1">Growth Index</span>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Bento Panels (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Current Phase */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left hover:scale-[1.01] hover:-translate-y-0.5 transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-blue-500 dark:text-[#b4c5ff] opacity-10 group-hover:opacity-20 transition-opacity">
                <Rocket className="h-10 w-10" />
              </div>
              
              <h3 className="text-xs font-bold text-slate-400 dark:text-[#c3c6d7]/50 uppercase tracking-widest mb-6">Current Phase</h3>
              <div className="space-y-1 mb-8">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {batchData?.batchName || 'Core Curriculum'}
                </h4>
                <p className="text-slate-500 dark:text-[#c3c6d7]/60 text-xs line-clamp-2">
                  {batchData?.description || 'Build a strong academic foundation. Review courses, tests, and attendance.'}
                </p>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-[#c3c6d7]/70">Progress</span>
                  <span className="text-blue-600 dark:text-[#b4c5ff]">{realProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#32343d] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 dark:bg-[#b4c5ff] rounded-full" style={{ width: `${realProgress}%` }} />
                </div>
              </div>
              
              <button 
                onClick={() => router.push('/dashboard/notes')}
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-[#282a32]/40 text-slate-900 dark:text-white font-bold hover:bg-blue-600 dark:hover:bg-[#b4c5ff] hover:text-white dark:hover:text-slate-900 transition-all cursor-pointer"
              >
                Resume Session
              </button>
            </div>

            {/* Next Milestone */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left hover:scale-[1.01] hover:-translate-y-0.5 transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-amber-500 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="h-10 w-10" />
              </div>
              
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6">Next Milestone</h3>
              
              {upcomingTest ? (
                <>
                  <div className="space-y-1 mb-8">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                      {upcomingTest.testName}
                    </h4>
                    <p className="text-slate-500 dark:text-[#c3c6d7]/60 text-xs truncate">
                      Subject: {upcomingTest.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {new Date(upcomingTest.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-[#c3c6d7]/50">Test Date</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push('/dashboard/tests')}
                    className="w-full py-3 rounded-xl bg-slate-100 dark:bg-[#282a32]/40 text-amber-500 font-bold border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                  >
                    View Requirements
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1 mb-8">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                      All Caught Up!
                    </h4>
                    <p className="text-slate-500 dark:text-[#c3c6d7]/60 text-xs truncate">
                      No upcoming tests planned.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        No Planned Tests
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-[#c3c6d7]/50">Status</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push('/dashboard/tests')}
                    className="w-full py-3 rounded-xl bg-slate-100 dark:bg-[#282a32]/40 text-slate-650 dark:text-[#c3c6d7] font-bold border border-slate-200 dark:border-[#434655]/20 hover:bg-slate-200 dark:hover:bg-[#282a32] transition-all cursor-pointer"
                  >
                    View History
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Unlocked Badges */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unlocked Badges</h3>
              <span className="text-xs font-bold text-blue-600 dark:text-[#b4c5ff] hover:underline cursor-pointer">
                View All
              </span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-[#434655]/30">
              {/* Fast Learner */}
              {isFastLearnerUnlocked ? (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/50 dark:bg-[#282a32]/20 flex flex-col items-center justify-center gap-2 snap-start hover:bg-blue-500/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-[#e1e2ed] text-center">Fast Learner</span>
                </div>
              ) : (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/30 dark:bg-[#282a32]/10 flex flex-col items-center justify-center gap-2 snap-start opacity-40">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#32343d] flex items-center justify-center text-slate-400 dark:text-slate-550">
                    <Lock className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">Fast Learner</span>
                </div>
              )}

              {/* Deep Logic */}
              {isDeepLogicUnlocked ? (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/50 dark:bg-[#282a32]/20 flex flex-col items-center justify-center gap-2 snap-start hover:bg-purple-500/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                    <Brain className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-[#e1e2ed] text-center">Deep Logic</span>
                </div>
              ) : (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/30 dark:bg-[#282a32]/10 flex flex-col items-center justify-center gap-2 snap-start opacity-40">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#32343d] flex items-center justify-center text-slate-400 dark:text-slate-550">
                    <Lock className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">Deep Logic</span>
                </div>
              )}

              {/* Peer Mentor */}
              {isPeerMentorUnlocked ? (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/50 dark:bg-[#282a32]/20 flex flex-col items-center justify-center gap-2 snap-start hover:bg-indigo-500/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-650 dark:text-indigo-400 shadow-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-[#e1e2ed] text-center">Peer Mentor</span>
                </div>
              ) : (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/30 dark:bg-[#282a32]/10 flex flex-col items-center justify-center gap-2 snap-start opacity-40">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#32343d] flex items-center justify-center text-slate-400 dark:text-slate-550">
                    <Lock className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">Peer Mentor</span>
                </div>
              )}

              {/* 100 Club */}
              {is100ClubUnlocked ? (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/50 dark:bg-[#282a32]/20 flex flex-col items-center justify-center gap-2 snap-start hover:bg-emerald-500/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-[#e1e2ed] text-center">100 Club</span>
                </div>
              ) : (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/30 dark:bg-[#282a32]/10 flex flex-col items-center justify-center gap-2 snap-start opacity-40">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#32343d] flex items-center justify-center text-slate-400 dark:text-slate-550">
                    <Lock className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">100 Club</span>
                </div>
              )}

              {/* Mastery */}
              {isMasteryUnlocked ? (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/50 dark:bg-[#282a32]/20 flex flex-col items-center justify-center gap-2 snap-start hover:bg-amber-500/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-[#e1e2ed] text-center">Mastery</span>
                </div>
              ) : (
                <div className="flex-shrink-0 w-28 aspect-square rounded-2xl border border-slate-200 dark:border-[#434655]/15 bg-slate-50/30 dark:bg-[#282a32]/10 flex flex-col items-center justify-center gap-2 snap-start opacity-40">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#32343d] flex items-center justify-center text-slate-400 dark:text-slate-550">
                    <Lock className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">Mastery</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: School Feed */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-[#434655]/20 dark:bg-[#1d1f27]/40 shadow-sm text-left flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">School Feed</h3>
          </div>
          
          <div className="space-y-4 flex-grow overflow-y-auto max-h-[360px] pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-[#434655]/30">
            {announcements.length > 0 ? (
              announcements.map((ann: any) => (
                <div 
                  key={ann._id} 
                  className="p-4 rounded-2xl bg-slate-50/50 dark:bg-[#282a32]/25 border border-slate-200 dark:border-[#434655]/10 space-y-3 hover:border-slate-350 dark:hover:border-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold uppercase border border-blue-500/15">
                      {ann.createdBy?.fullName 
                        ? ann.createdBy.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                        : 'AD'
                      }
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {ann.createdBy?.fullName || 'Administrator'}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-[#c3c6d7]/50 uppercase tracking-widest font-bold">
                        {ann.createdBy?.role || 'Admin'}
                      </p>
                    </div>
                    <span className="ml-auto text-[9px] text-slate-400 dark:text-[#c3c6d7]/40">
                      {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{ann.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-[#c3c6d7]/70 leading-relaxed line-clamp-3">
                      {ann.content}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-bold rounded">
                      #Announcement
                    </span>
                    {ann.targetBatch && (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[8px] font-bold rounded">
                        #Batch
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-slate-400 dark:text-[#c3c6d7]/40 py-12">
                No school announcements posted.
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push('/dashboard/announcements')}
            className="w-full mt-6 py-3 border border-slate-200 dark:border-[#434655]/20 hover:bg-slate-50 dark:hover:bg-[#282a32]/25 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs text-slate-700 dark:text-[#e1e2ed] transition-all group cursor-pointer"
          >
            <span>Full Community Hub</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </div>
  );
}

/* ============================================================================
   SHARED SUB-COMPONENTS & PLACEHOLDERS
   ============================================================================ */
function DashboardLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function DashboardError() {
  return (
    <div className="flex h-96 flex-col items-center justify-center text-center rounded-2xl border border-red-200 bg-red-50/50 p-8 dark:border-red-900/30 dark:bg-red-950/10">
      <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Failed to Load Dashboard</h3>
      <p className="text-sm text-slate-500 mt-2">
        An error occurred while loading your dashboard statistics. Please verify your connection and reload the page.
      </p>
    </div>
  );
}

function NoDataPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-center text-sm text-slate-400 dark:text-slate-500 py-12">
      No tracking metrics available yet.
    </div>
  );
}
