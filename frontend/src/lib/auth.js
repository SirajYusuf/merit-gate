'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

export const useRequireAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    api.get('/api/auth/profile')
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        clearToken();
        router.replace('/login');
      });
  }, [router]);

  const logout = () => {
    clearToken();
    router.replace('/login');
  };

  return { user, loading, logout };
};
