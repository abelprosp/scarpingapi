'use client';

import { useEffect, useState } from 'react';
import { api, BillingProfile, formatBRL, formatCredits, PixPayment } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

export default function BillingPageContent() {
  useRequireAuth();
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [activePix, setActivePix] = useState<PixPayment | null>(null);
  const [payg, setPayg] = useState(false);

  function loadProfile() {
    api.billingProfile().then((p) => {
      setProfile(p);
      setPayg(p.payAsYouGoEnabled);
    }).catch(() => setProfile(null));
  }

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!activePix || activePix.status !== 'PENDING') return;
    const interval = setInterval(async () => {
      try {
        const updated = await api.pixStatus(activePix.txid);
        if (updated.status === 'PAID') {
          setActivePix(updated);
          setMessage('Pagamento confirmado! Créditos liberados.');
          loadProfile();
        } else if (updated.status === 'EXPIRED') {
          setActivePix(updated);
          setMessage('PIX expirado — gere um novo pagamento.');
        }
      } catch {
        /* polling silencioso */
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activePix]);

  async function togglePayg() {
    const next = !payg;
    setLoading('payg');
    try {
      await api.setPayAsYouGo(next);
      setPayg(next);
      setMessage(next ? 'Consumo avulso ativado — após 70k/mês cobramos R$5 a cada 500 créditos.' : 'Consumo avulso desativado.');
      loadProfile();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro');
    } finally {
      setLoading(null);
    }
  }

  async function handlePix(action: 'subscribe' | 'credits' | 'overage', qty = 1) {
    setLoading(action);
    setMessage('');
    setActivePix(null);
    try {
      let pix: PixPayment;
      if (action === 'subscribe') pix = await api.pixSubscribe();
      else if (action === 'overage') pix = await api.pixOverage();
      else pix = await api.pixBuyCredits(qty);
      setActivePix(pix);
      setMessage('PIX gerado — escaneie o QR Code ou copie o código.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao gerar PIX');
    } finally {
      setLoading(null);
    }
  }

  const monthlyPct = profile && profile.monthlyAllowance > 0
    ? Math.min(100, (profile.monthlyUsed / profile.monthlyAllowance) * 100)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">Planos & Billing</h1>
      <p className="mt-1 text-muted">Plano mensal R$ 197 · 70.000 créditos · Avulso R$ 5/500</p>

      {message && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      {profile && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted">Créditos avulsos</p>
            <p className="text-2xl font-bold text-accent">{formatCredits(profile.credits)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted">Mensal usado</p>
            <p className="text-2xl font-bold">{formatCredits(profile.monthlyUsed)}</p>
            <p className="text-xs text-muted">de {formatCredits(profile.monthlyAllowance)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted">Mensal restante</p>
            <p className="text-2xl font-bold text-accent">{formatCredits(profile.monthlyRemaining)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted">Overage pendente</p>
            <p className="text-2xl font-bold">{formatCredits(profile.overagePending)}</p>
          </div>
        </div>
      )}

      {profile && profile.monthlyAllowance > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-sm">
            <span>Uso mensal (70k incluídos)</span>
            <span>{monthlyPct.toFixed(0)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${monthlyPct}%` }} />
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Consumo avulso (pay-as-you-go)</h2>
            <p className="mt-1 text-sm text-muted">
              Após esgotar os 70k mensais, cobramos R$ 5 a cada 500 créditos extras via PIX.
            </p>
          </div>
          <button
            onClick={togglePayg}
            disabled={loading === 'payg'}
            className={`relative h-7 w-12 rounded-full transition ${payg ? 'bg-accent' : 'bg-border'}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${payg ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-violet-500/40 bg-violet-500/5 p-6">
          <h3 className="font-bold">Plano Mensal</h3>
          <p className="mt-2 text-2xl font-bold">R$ 197<span className="text-sm font-normal text-muted">/mês</span></p>
          <p className="text-sm text-violet-400">70.000 créditos/mês</p>
          <button
            onClick={() => handlePix('subscribe')}
            disabled={loading === 'subscribe'}
            className="mt-4 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading === 'subscribe' ? 'Gerando PIX...' : 'Pagar via PIX'}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-bold">Créditos avulsos</h3>
          <p className="mt-2 text-2xl font-bold">R$ 5<span className="text-sm font-normal text-muted"> / 500 créditos</span></p>
          <button
            onClick={() => handlePix('credits', 1)}
            disabled={loading === 'credits'}
            className="mt-4 w-full rounded-lg border border-border py-2.5 text-sm font-semibold hover:border-accent"
          >
            {loading === 'credits' ? 'Gerando PIX...' : 'Comprar 1 pacote'}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-bold">Overage pendente</h3>
          <p className="mt-2 text-sm text-muted">
            {profile ? `${formatCredits(profile.overagePending)} créditos` : '—'}
          </p>
          <button
            onClick={() => handlePix('overage')}
            disabled={loading === 'overage' || !profile?.overagePending}
            className="mt-4 w-full rounded-lg border border-amber-500/50 py-2.5 text-sm font-semibold text-amber-400 disabled:opacity-40"
          >
            {loading === 'overage' ? 'Gerando PIX...' : 'Pagar overage via PIX'}
          </button>
        </div>
      </div>

      {activePix && (
        <div className="mt-8 rounded-xl border border-accent/40 bg-accent/5 p-6">
          <h3 className="font-semibold">Pagamento PIX — {formatBRL(activePix.amount)}</h3>
          <p className="mt-1 text-sm text-muted">{activePix.creditsGranted} créditos · {activePix.type}</p>
          {activePix.qrCode && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`data:image/png;base64,${activePix.qrCode}`} alt="QR Code PIX" className="mx-auto mt-4 h-48 w-48" />
          )}
          <div className="mt-4">
            <p className="text-xs text-muted">Copia e cola:</p>
            <code className="mt-1 block break-all rounded bg-background p-3 text-xs">{activePix.copyPaste}</code>
            <button
              onClick={() => navigator.clipboard.writeText(activePix.copyPaste)}
              className="mt-2 text-sm text-accent hover:underline"
            >
              Copiar código PIX
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
