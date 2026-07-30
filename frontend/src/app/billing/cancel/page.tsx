import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold">Checkout cancelado</h1>
        <p className="mt-2 text-muted">Nenhuma cobrança foi feita.</p>
        <Link href="/dashboard/billing" className="mt-8 inline-block rounded-lg border border-border px-6 py-3 font-semibold hover:border-accent">
          Ver planos
        </Link>
      </div>
    </div>
  );
}
