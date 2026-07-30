'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';

export function saveSession(accessToken: string, user: User) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) router.replace('/login');
  }, [router]);
}

export async function refreshUser(): Promise<User | null> {
  try {
    const user = await api.me();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

export function logout() {
  clearSession();
  window.location.href = '/';
}
