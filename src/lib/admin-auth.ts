'use client';

const AUTH_KEY = 'ww_admin_auth';
const CREDENTIALS = { username: 'admin', password: 'westernwheelcraft2026' };

export function login(username: string, password: string): boolean {
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ username, at: Date.now() }));
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    // Session expires after 8 hours
    return Date.now() - data.at < 8 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
