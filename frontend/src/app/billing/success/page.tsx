import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-accent/30 bg-card p-8 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="mt-4 text-2xl font-bold">Pagamento confirmado!</h1>
        <p className="mt-2 text-muted">Seus créditos serão adicionados em instantes.</p>
        <Link href="/dashboard" className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-background">
          Ir para o dashboard
        </Link>
      </div>
    </div>
  );
}
