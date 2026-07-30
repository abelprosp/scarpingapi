'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, formatBRL, formatCredits, Plan, WHATSAPP_URL } from '@/lib/api';

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.plans()
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const displayPlans = plans.length
    ? plans.filter((p) => ['FREE', 'STARTER', 'PRO'].includes(p.tier))
    : [
        {
          id: 'free',
          name: 'Grátis',
          tier: 'FREE',
          description: 'Créditos ao cadastrar',
          priceMonthly: 0,
          priceYearly: 0,
          creditsMonthly: 2700,
          rateLimit: 20,
          maxApiKeys: 1,
          features: ['2.700 créditos grátis', '20 req/min', '1 API Key'],
        },
        {
          id: 'business',
          name: 'Business',
          tier: 'STARTER',
          description: 'Produção e alto volume',
          priceMonthly: 19700,
          priceYearly: 197000,
          creditsMonthly: 100000,
          rateLimit: 120,
          maxApiKeys: 5,
          features: ['100.000 créditos/mês', '120 req/min', '5 API Keys', 'APIs avançadas'],
        },
        {
          id: 'pro',
          name: 'Pro',
          tier: 'PRO',
          description: 'Equipes exigentes',
          priceMonthly: 49700,
          priceYearly: 497000,
          creditsMonthly: 350000,
          rateLimit: 400,
          maxApiKeys: 15,
          features: ['350.000 créditos/mês', '400 req/min', '15 API Keys'],
        },
      ] as Plan[];

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Planos simples, sem surpresas</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Comece grátis com 2.700 créditos. Escale quando precisar.
          </p>
        </div>

        {loading ? (
          <p className="mt-12 text-center text-muted">Carregando planos...</p>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {displayPlans.map((plan) => {
              const highlighted = plan.tier === 'STARTER';
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 ${
                    highlighted
                      ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                      : 'border-border bg-card'
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-background">
                      Mais popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">
                      {plan.priceMonthly === 0 ? 'Grátis' : formatBRL(plan.priceMonthly)}
                    </span>
                    {plan.priceMonthly > 0 && (
                      <span className="text-muted">/mês</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-accent">
                    {formatCredits(plan.creditsMonthly)} créditos/mês
                  </p>
                  <ul className="mt-6 space-y-2 text-sm text-muted">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-accent">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {plan.tier === 'FREE' ? (
                      <Link
                        href="/register"
                        className="block w-full rounded-lg border border-border py-3 text-center text-sm font-semibold hover:border-accent hover:text-accent"
                      >
                        Criar conta grátis
                      </Link>
                    ) : plan.tier === 'STARTER' ? (
                      <Link
                        href="/register"
                        className="block w-full rounded-lg bg-accent py-3 text-center text-sm font-semibold text-background hover:bg-accent/90"
                      >
                        Assinar Business — R$ 197/mês
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/billing"
                        className="block w-full rounded-lg border border-border py-3 text-center text-sm font-semibold hover:border-accent"
                      >
                        Ver no dashboard
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted">
          Precisa de volume enterprise?{' '}
          <a href={WHATSAPP_URL} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            Fale conosco no WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}
