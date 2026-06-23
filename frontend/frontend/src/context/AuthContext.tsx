"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  profile_picture?: string;
  marketing_emails: boolean;
  order_updates: boolean;
  personalized_ads: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('lumiere_token');
      if (token) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
        } catch (err) {
          localStorage.removeItem('lumiere_token');
          localStorage.removeItem('lumiere_refresh');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    if (res.access) {
      localStorage.setItem('lumiere_token', res.access);
      localStorage.setItem('lumiere_refresh', res.refresh);
      setUser(res.user);
      router.push('/products');
    }
  };

  const register = async (data: any) => {
    await authApi.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    localStorage.removeItem('lumiere_token');
    localStorage.removeItem('lumiere_refresh');
    localStorage.removeItem('lumiere_user');
    setUser(null);
    router.push('/auth/login');
  };

  const updateUser = async (data: Partial<User>) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
