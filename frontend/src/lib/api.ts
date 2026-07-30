export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const APP_NAME = 'NoviqSearch';
export const WHATSAPP = '5551995501677';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Quero contratar o NoviqSearch')}`;

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  credits: number;
}

export interface Plan {
  id: string;
  name: string;
  tier: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  creditsMonthly: number;
  rateLimit: number;
  maxApiKeys: number;
  features: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  status: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UsageLog {
  searchType: string;
  query: string;
  creditsUsed: number;
  responseTime: number;
  cached: boolean;
  success: boolean;
  createdAt: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data.message === 'string'
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(', ')
          : 'Erro na requisição';
    throw new ApiError(msg, res.status);
  }

  return data as T;
}

export const api = {
  register: (body: { email: string; password: string; name?: string }) =>
    request<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: () => request<User>('/auth/me'),

  credits: () => request<{ credits: number }>('/credits'),

  usage: () => request<UsageLog[]>('/usage'),

  plans: () => request<Plan[]>('/billing/plans'),

  checkout: (planId: string) =>
    request<{ url?: string; message?: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),

  listApiKeys: () => request<ApiKey[]>('/api-keys'),

  createApiKey: (name: string) =>
    request<{ key: string; id: string; name: string; keyPrefix: string }>('/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  revokeApiKey: (id: string) =>
    request<void>(`/api-keys/${id}`, { method: 'DELETE' }),
};

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatCredits(n: number): string {
  return n.toLocaleString('pt-BR');
}
