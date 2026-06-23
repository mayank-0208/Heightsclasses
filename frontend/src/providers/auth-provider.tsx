'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserInContext: (updated: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user profile on mount if tokens exist
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            handleLogoutState();
          }
        } catch (error) {
          console.error('Initial profile fetch failed:', error);
          handleLogoutState();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for custom token refresh failure logouts
    const handleLogoutEvent = () => {
      handleLogoutState();
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  // Handle route guards based on user state
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname === '/login' || pathname.startsWith('/forgot-password');

    if (!user) {
      if (!isPublicRoute) {
        router.push('/login');
      }
    } else {
      if (user.mustChangePassword && pathname !== '/change-password') {
        router.push('/change-password');
      } else if (!user.mustChangePassword && pathname === '/change-password') {
        router.push('/dashboard');
      } else if (isPublicRoute) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const handleLogoutState = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const login = async (identifier: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: identifier, password });
      const { accessToken, refreshToken, user: userData } = res.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      
      if (userData.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }

      return userData;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      handleLogoutState();
    }
  };

  const updateUserInContext = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUserInContext,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
