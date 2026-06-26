'use client';

const API_BASE = '/api';

interface ApiUser {
  id: number;
  tenant_id: number;
  company_name: string;
  role: string;
}

interface ApiError {
  message: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('receiptsai_token');
}

function getUser(): ApiUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('receiptsai_user');
  return raw ? JSON.parse(raw) : null;
}

function clearAuth(): void {
  localStorage.removeItem('receiptsai_token');
  localStorage.removeItem('receiptsai_user');
}

export { getToken, getUser, clearAuth };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  company_name: string;
  admin_name: string;
  admin_phone: string;
  admin_email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: ApiUser;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ message: 'Credenciales inválidas' }));
    throw new Error(err.message);
  }

  const result: AuthResponse = await res.json();
  localStorage.setItem('receiptsai_token', result.access_token);
  localStorage.setItem('receiptsai_user', JSON.stringify(result.user));
  return result;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ message: 'Error al registrar' }));
    throw new Error(err.message);
  }

  const result: AuthResponse = await res.json();
  localStorage.setItem('receiptsai_token', result.access_token);
  localStorage.setItem('receiptsai_user', JSON.stringify(result.user));
  return result;
}

export function logout(): void {
  localStorage.removeItem('receiptsai_token');
  localStorage.removeItem('receiptsai_user');
  if (typeof window !== 'undefined') {
    window.location.hash = '#/login';
  }
}
