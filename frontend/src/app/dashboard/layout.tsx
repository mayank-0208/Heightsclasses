'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/providers/theme-provider';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CalendarCheck,
  Award,
  FileDown,
  Receipt,
  Megaphone,
  History,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  GraduationCap,
  Plus,
  Search,
  Bell,
  Sparkles,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: ('admin' | 'teacher' | 'student')[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
  { title: 'Students', href: '/dashboard/students', icon: Users, roles: ['admin', 'teacher'] },
  { title: 'Teachers', href: '/dashboard/teachers', icon: GraduationCap, roles: ['admin'] },
  { title: 'Batches', href: '/dashboard/batches', icon: FolderKanban, roles: ['admin', 'teacher'] },
  { title: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck, roles: ['admin', 'teacher', 'student'] },
  { title: 'Tests & Results', href: '/dashboard/tests', icon: Award, roles: ['admin', 'teacher', 'student'] },
  { title: 'Notes Library', href: '/dashboard/notes', icon: FileDown, roles: ['admin', 'teacher', 'student'] },
  { title: 'Fee Payments', href: '/dashboard/fees', icon: Receipt, roles: ['admin', 'student'] },
  { title: 'Announcements', href: '/dashboard/announcements', icon: Megaphone, roles: ['admin', 'teacher', 'student'] },
  { title: 'System Logs & Reports', href: '/dashboard/reports', icon: History, roles: ['admin'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#11131b]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-350 border-t-blue-600 dark:border-slate-800 dark:border-t-white" />
      </div>
    );
  }

  if (!user) return null;

  // Filter navigation items by active user role
  const allowedNavItems = navItems.filter((item) => item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between border-r border-slate-200 bg-white p-6 dark:border-[#434655]/15 dark:bg-[#191b23]/80 backdrop-blur-xl">
      <div className="space-y-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center p-1 shrink-0 shadow-md">
            <img src="/hlogo.png" alt="Heights Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-[#e1e2ed] leading-none">
              Heights
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-[#c3c6d7]/60 uppercase tracking-widest mt-1 font-semibold">
              Educational OS
            </p>
          </div>
        </div>



        {/* Navigation Items */}
        <nav className="space-y-1">
          {allowedNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-[#2563eb]/20 dark:text-[#b4c5ff] dark:border-r-2 dark:border-[#b4c5ff] dark:rounded-r-none'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-[#c3c6d7] dark:hover:bg-[#282a32]/40 dark:hover:text-[#e1e2ed]'
                  }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Support and Help Options */}
      <div className="mt-auto space-y-1 border-t border-slate-150 pt-4 dark:border-[#434655]/15">

        {/* User Session Info & Logout */}
        <div className="flex items-center gap-3 px-2 py-3 mt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-[#282a32] text-slate-600 dark:text-[#c3c6d7] border border-slate-200 dark:border-[#434655]/20">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-[#e1e2ed]">
              {user.fullName}
            </h4>
            <span className="truncate text-xs text-slate-500 dark:text-[#c3c6d7]/65 uppercase tracking-wider font-bold">
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-650 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#11131b] transition-colors duration-300">

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 md:fixed md:inset-y-0 md:flex md:flex-col z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div className="relative z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col">
            <SidebarContent />
            {/* Close Button Inside Drawer */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Main Panel Area */}
      <div className="flex flex-1 flex-col md:pl-64">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-45 flex h-16 items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md px-6 dark:border-[#434655]/15 dark:bg-[#11131b]/60 transition-colors duration-300">

          <div className="flex items-center gap-6 flex-1">
            {/* Mobile Sidebar Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-900 dark:text-[#c3c6d7] dark:hover:text-white md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search records box */}
            {user.role !== 'student' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (searchVal.trim()) {
                  router.push(`/dashboard/students?search=${encodeURIComponent(searchVal)}`);
                } else {
                  router.push('/dashboard/students');
                }
              }} className="relative group hidden lg:block">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-[#8d90a0]/60 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  className="bg-slate-100 dark:bg-[#191b23] border-none rounded-full pl-10 pr-4 py-1.5 w-[320px] text-sm focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-slate-400 dark:placeholder-[#8d90a0]/50 text-slate-800 dark:text-[#e1e2ed]"
                  placeholder="Search students, email, ID..."
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
              </form>
            )}

          </div>

          {/* Action buttons (Theme Toggle, Notifications, User Menu) */}
          <div className="flex items-center gap-4">


            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-[#434655]/20 pl-4">
              {/* Light / Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#191b23] dark:hover:bg-[#282a32] dark:text-[#c3c6d7] transition-colors shadow-xs cursor-pointer"
              >
                {mounted ? (
                  theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
                ) : (
                  <span className="h-5 w-5" />
                )}
              </button>

              {/* Notifications */}
              <Link 
                href="/dashboard/announcements"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#191b23] dark:hover:bg-[#282a32] dark:text-[#c3c6d7] transition-colors shadow-xs cursor-pointer"
              >
                <Bell className="h-5 w-5" />
              </Link>

              {/* Minimal User Role Tag badge */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-900 dark:bg-[#1d1f27] dark:text-[#e1e2ed] select-none capitalize border border-transparent dark:border-[#434655]/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {user.role}
              </div>
            </div>

          </div>
        </header>

        {/* Content Area viewport */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
