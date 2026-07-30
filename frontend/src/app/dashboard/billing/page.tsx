'use client';

import { Suspense } from 'react';
import BillingPageContent from './BillingPageContent';

export default function BillingPage() {
  return (
    <Suspense fallback={<p className="text-muted">Carregando billing...</p>}>
      <BillingPageContent />
    </Suspense>
  );
}
