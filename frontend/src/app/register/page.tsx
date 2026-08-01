'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, APP_NAME } from '@/lib/api';
import { saveSession } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register({ email, password, name: name || undefined });
      saveSession(res.accessToken, res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <Link href="/" className="text-xl font-bold text-accent">{APP_NAME}</Link>
        <h1 className="mt-6 text-2xl font-bold">Criar conta</h1>
        <p className="mt-1 text-sm text-muted">
          Ganhe <strong className="text-accent">500 créditos grátis</strong> ao se cadastrar.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm text-muted">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-accent"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="text-sm text-muted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm text-muted">Senha (mín. 8 caracteres)</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-background disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar conta — 500 créditos grátis'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
