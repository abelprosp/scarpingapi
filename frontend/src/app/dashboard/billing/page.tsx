'use client';

import { useEffect, useState } from 'react';
import { api, formatBRL, formatCredits, Plan, WHATSAPP_URL } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

export default function BillingPage() {
  useRequireAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.plans().then(setPlans).catch(() => setPlans([]));
  }, []);

  async function handleCheckout(planId: string) {
    setLoading(planId);
    setMessage('');
    try {
      const res = await api.checkout(planId);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setMessage(
          res.message ||
            'Stripe não configurado. Entre em contato via WhatsApp para contratar.',
        );
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro no checkout');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Planos & Billing</h1>
      <p className="mt-1 text-muted">Escolha o plano ideal para seu volume</p>

      {message && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          {message}{' '}
          <a href={WHATSAPP_URL} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-6 ${
              plan.tier === 'STARTER' ? 'border-accent bg-accent/5' : 'border-border bg-card'
            }`}
          >
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <p className="text-sm text-muted">{plan.description}</p>
            <p className="mt-4 text-3xl font-bold">
              {plan.priceMonthly === 0 ? 'Grátis' : formatBRL(plan.priceMonthly)}
              {plan.priceMonthly > 0 && <span className="text-base font-normal text-muted">/mês</span>}
            </p>
            <p className="mt-1 text-accent">{formatCredits(plan.creditsMonthly)} créditos/mês</p>
            <ul className="mt-4 space-y-1 text-sm text-muted">
              {(plan.features as string[]).map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            {plan.tier === 'FREE' ? (
              <p className="mt-6 text-sm text-muted">Plano atual ao cadastrar (2.700 créditos)</p>
            ) : plan.tier === 'ENTERPRISE' ? (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block rounded-lg border border-border px-6 py-2 text-sm font-semibold hover:border-accent"
              >
                Falar no WhatsApp
              </a>
            ) : (
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                className="mt-6 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-background disabled:opacity-50"
              >
                {loading === plan.id ? 'Redirecionando...' : 'Assinar com Stripe'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
