'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#11131b] px-4 py-12 text-[#e1e2ed] overflow-hidden font-sans">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Rotated Card Illustration (Desktop Only) */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center space-y-6">
          <div className="relative w-full aspect-square max-w-[320px] mx-auto">
            {/* Rotated background card 1 */}
            <div className="absolute inset-0 bg-white/5 rounded-[40px] rotate-6 border border-white/10" />
            {/* Rotated background card 2 */}
            <div className="absolute inset-0 bg-white/5 rounded-[40px] -rotate-3 border border-white/10" />
            {/* Main card */}
            <div className="relative w-full h-full bg-[#1d1f27]/40 backdrop-blur-xl border border-[#434655]/20 rounded-[40px] flex flex-col items-center justify-center p-8 overflow-hidden shadow-2xl">
              <img src="/hlogo.png" alt="Heights ERP" className="h-28 w-auto object-contain mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold tracking-tight text-white">Heights ERP</h3>
              <p className="text-sm text-[#c3c6d7]/60 text-center mt-2">All high-density analytical systems engaged.</p>
              
              {/* System status bar widget */}
              <div className="absolute bottom-6 left-6 right-6 space-y-2 pointer-events-none">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-4/5 rounded-full" />
                </div>
                <div className="flex justify-between text-white/60 text-xs font-semibold">
                  <span>System Status</span>
                  <span className="text-white font-bold">98% Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Glass Card */}
        <div className="col-span-1 md:col-span-6">
          <div className="w-full max-w-md mx-auto rounded-2xl bg-[#1d1f27]/40 backdrop-blur-xl border border-[#434655]/20 p-8 shadow-2xl transition-all duration-300 hover:translate-y-[-4px] hover:scale-[1.01] hover:shadow-[0_12px_24px_-10px_rgba(37,99,235,0.2)] hover:border-[#2563eb]/30 sm:p-10 group">
            
            {/* Logo & Header */}
            <div className="flex flex-col items-center text-center">
              <img src="/hlogo.png" alt="Heights Logo" className="h-16 w-auto object-contain mb-2 md:hidden animate-pulse" />
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Heights Classes
              </h2>
              <p className="mt-2 text-sm text-[#c3c6d7]/60">
                Coaching ERP Management System
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                
                {/* Email Input */}
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email / Roll No
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8d90a0]/60">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      id="email-address"
                      name="email"
                      type="text"
                      autoComplete="off"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-[#434655]/30 bg-[#191b23] py-3 pl-10 pr-3 text-[#e1e2ed] placeholder-[#8d90a0]/40 transition-colors focus:border-[#2563eb]/50 focus:outline-none focus:ring-1 focus:ring-[#2563eb]/30 sm:text-sm"
                      placeholder="Email or Roll No."
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8d90a0]/60">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-xl border border-[#434655]/30 bg-[#191b23] py-3 pl-10 pr-10 text-[#e1e2ed] placeholder-[#8d90a0]/40 transition-colors focus:border-[#2563eb]/50 focus:outline-none focus:ring-1 focus:ring-[#2563eb]/30 sm:text-sm"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8d90a0]/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-xl bg-[#2563eb] hover:bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:bg-blue-800 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
