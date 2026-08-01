'use client';

import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/api';

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '',
    credits: '2.700 créditos de inteligência',
    hint: 'Ao criar conta — sem cartão',
    features: [
      'Search, News, Images',
      'Swagger e documentação',
      '1 API Key',
      'Ideal para protótipos de agentes',
    ],
    cta: 'Começar grátis',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Business Launch',
    price: 'R$ 197',
    period: '/mês',
    credits: '70.000 créditos/mês',
    hint: 'Oferta de lançamento — early adopters',
    features: [
      'Todas as APIs ativas',
      'Research & Deep Research',
      'Crawl, Extract, Browser',
      'RAG, Embeddings, Agent API',
      'Pay-as-you-go via PIX',
    ],
    cta: 'Assinar via dashboard',
    href: '/register',
    highlight: true,
  },
  {
    name: 'Pay-as-you-go',
    price: 'R$ 5',
    period: '/ pacote',
    credits: '500 créditos avulsos',
    hint: 'Sem validade — complementa qualquer plano',
    features: [
      'Créditos de inteligência pré-pagos',
      'PIX instantâneo',
      'Sem assinatura obrigatória',
      'Overage automático opcional',
    ],
    cta: 'Comprar créditos',
    href: '/register',
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border/60 bg-white py-24 text-gray-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Créditos de inteligência para cada estágio
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Grátis para experimentar. Business Launch para escalar. Avulso quando precisar de mais.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 ${
                plan.highlight
                  ? 'border-purple-500 bg-white shadow-lg shadow-purple-500/10'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Mais popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-500">{plan.period}</span>}
              </div>
              <p className="mt-2 text-sm font-medium text-purple-600">{plan.credits}</p>
              <p className="mt-1 text-xs text-gray-500">{plan.hint}</p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                {plan.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold ${
                  plan.highlight
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'border border-gray-300 text-gray-900 hover:border-purple-500'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="font-semibold text-gray-900">Roadmap de planos (Phase 2)</h3>
            <p className="mt-2 text-sm text-gray-600">
              Starter <strong>R$ 39</strong> · Pro <strong>R$ 149</strong> · Business{' '}
              <strong>R$ 499</strong> — tiers completos documentados em{' '}
              <code className="text-purple-600">docs/roadmap-phases.md</code>.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="font-semibold text-gray-900">Enterprise</h3>
            <p className="mt-2 text-sm text-gray-600">
              SSO, SLA, IP allowlist, white-label e volume customizado para times e integradores.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-purple-600 hover:underline"
            >
              Falar com vendas →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
