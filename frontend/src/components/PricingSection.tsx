'use client';

import Link from 'next/link';

const WEB_SEARCH_CREDITS = 2;

function costPerWebSearchMonthly(): string {
  const perCredit = 197 / 70000;
  return (perCredit * WEB_SEARCH_CREDITS).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 4,
  });
}

function costPerWebSearchAvulso(): string {
  return ((5 / 500) * WEB_SEARCH_CREDITS).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-24 text-zinc-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simples e previsível.</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-500">
            Comece grátis ou escolha o plano mensal para alto volume.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Teste Grátis */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-800">Teste Grátis</h3>
            <div className="mt-6">
              <span className="text-4xl font-bold">R$ 0</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">2.700 créditos · sem cartão</p>
            <ul className="mt-8 space-y-3 text-sm text-zinc-600">
              <li>✓ Acesso imediato ao painel</li>
              <li>✓ API Key em minutos</li>
              <li>✓ Swagger docs incluído</li>
              <li>✓ Sem validade no trial</li>
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full rounded-xl bg-zinc-900 py-3.5 text-center text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Testar grátis — 2.700 créditos
            </Link>
          </div>

          {/* Plano Mensal */}
          <div className="relative rounded-2xl border-2 border-violet-500 bg-white p-8 shadow-lg shadow-violet-100">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Mais popular
            </span>
            <h3 className="text-lg font-semibold text-zinc-800">Plano Mensal</h3>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">R$ 197</span>
              <span className="text-zinc-500">/ mês</span>
            </div>
            <p className="mt-2 text-sm font-medium text-violet-700">70.000 créditos por mês</p>
            <p className="mt-1 text-xs text-zinc-400">
              ≈ {costPerWebSearchMonthly()} por busca web simples
            </p>
            <ul className="mt-8 space-y-3 text-sm text-zinc-600">
              <li>✓ 70k créditos renovados todo mês</li>
              <li>✓ Ideal para produção e automações</li>
              <li>✓ Consumo avulso opcional após o limite</li>
              <li>✓ Suporte prioritário</li>
              <li>✓ Cancele quando quiser</li>
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full rounded-xl bg-zinc-900 py-3.5 text-center text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Assinar plano mensal
            </Link>
          </div>

          {/* Avulso */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-800">Avulso</h3>
            <div className="mt-6">
              <span className="text-4xl font-bold">R$ 5</span>
              <span className="text-zinc-500"> / 500 créditos</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              ≈ {costPerWebSearchAvulso()} por busca web simples
            </p>
            <ul className="mt-8 space-y-3 text-sm text-zinc-600">
              <li>✓ Pague só pelo que usar</li>
              <li>✓ Sem mensalidade</li>
              <li>✓ Créditos sem validade</li>
              <li>✓ Compre pelo painel via PIX</li>
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full rounded-xl border-2 border-zinc-900 py-3.5 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Comprar créditos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
