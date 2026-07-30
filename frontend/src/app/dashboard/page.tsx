'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, formatCredits, User } from '@/lib/api';
import { getStoredUser, refreshUser, useRequireAuth } from '@/lib/auth';

export default function DashboardPage() {
  useRequireAuth();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    Promise.all([refreshUser(), api.credits()])
      .then(([u, c]) => {
        if (u) setUser(u);
        setCredits(c.credits);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted">Olá, {user?.name || user?.email || '...'}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted">Créditos disponíveis</p>
          <p className="mt-2 text-3xl font-bold text-accent">
            {credits !== null ? formatCredits(credits) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted">Plano recomendado</p>
          <p className="mt-2 text-lg font-semibold">Business — R$ 197/mês</p>
          <p className="text-sm text-muted">70.000 créditos/mês</p>
          <Link href="/dashboard/billing" className="mt-3 inline-block text-sm text-accent hover:underline">
            Ver planos →
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted">Documentação</p>
          <a
            href="https://api.noviqsearch.online/docs"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-accent hover:underline"
          >
            api.noviqsearch.online/docs →
          </a>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Início rápido</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-background p-4 text-xs text-muted">
{`curl -X POST "https://api.noviqsearch.online/api/v1/search" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sk_sua_chave" \\
  -d '{"q": "sua busca", "gl": "br", "hl": "pt"}'`}
        </pre>
        <Link href="/dashboard/keys" className="mt-4 inline-block text-sm text-accent hover:underline">
          Criar API Key →
        </Link>
      </div>
    </div>
  );
}
