'use client';

import { useAuth as useAuthProvider } from '@/providers/auth-provider';

export const useAuth = () => {
  return useAuthProvider();
};
