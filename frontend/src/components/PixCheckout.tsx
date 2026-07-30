'use client';

import { useEffect, useState } from 'react';
import { PixPayment, api } from '@/lib/api';

interface PixCheckoutProps {
  payment: PixPayment;
  onPaid?: () => void;
  onClose?: () => void;
}

export function PixCheckout({ payment, onPaid, onClose }: PixCheckoutProps) {
  const [status, setStatus] = useState(payment.status);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== 'PENDING') return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.pixStatus(payment.txid);
        setStatus(updated.status);
        if (updated.status === 'PAID') {
          onPaid?.();
        }
      } catch {
        /* polling silencioso */
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [payment.txid, status, onPaid]);

  async function copyPaste() {
    await navigator.clipboard.writeText(payment.copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">Pagamento via PIX</h3>
            <p className="text-sm text-muted">
              {status === 'PAID'
                ? 'Pagamento confirmado!'
                : status === 'EXPIRED'
                  ? 'PIX expirado — gere um novo'
                  : 'Escaneie o QR ou copie o código'}
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-muted hover:text-foreground">
              ✕
            </button>
          )}
        </div>

        {status === 'PENDING' && payment.qrCode && (
          <div className="mt-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${payment.qrCode}`}
              alt="QR Code PIX"
              className="h-48 w-48 rounded-lg border border-border bg-white p-2"
            />
          </div>
        )}

        {status === 'PAID' && (
          <div className="mt-6 rounded-lg bg-green-500/10 px-4 py-6 text-center text-green-400">
            ✓ Pagamento recebido — créditos liberados!
          </div>
        )}

        {status === 'PENDING' && payment.copyPaste && (
          <div className="mt-4">
            <label className="text-xs font-medium text-muted">Pix copia e cola</label>
            <div className="mt-1 flex gap-2">
              <input
                readOnly
                value={payment.copyPaste}
                className="flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs"
              />
              <button
                onClick={copyPaste}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-background"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between text-sm text-muted">
          <span>{payment.creditsGranted.toLocaleString('pt-BR')} créditos</span>
          <span>
            R$ {(payment.amount / 100).toFixed(2).replace('.', ',')}
          </span>
        </div>

        {status === 'PENDING' && (
          <p className="mt-3 animate-pulse text-center text-xs text-accent">
            Aguardando confirmação do pagamento...
          </p>
        )}
      </div>
    </div>
  );
}
