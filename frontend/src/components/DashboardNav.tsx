'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@/lib/api';
import { logout } from '@/lib/auth';

const links = [
  { href: '/dashboard', label: 'Visão geral' },
  { href: '/dashboard/keys', label: 'API Keys' },
  { href: '/dashboard/usage', label: 'Uso' },
  { href: '/dashboard/billing', label: 'Planos' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-border bg-card md:min-h-screen md:w-56 md:border-b-0 md:border-r">
      <div className="border-b border-border p-4">
        <Link href="/" className="font-bold text-accent">{APP_NAME}</Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
              pathname === link.href
                ? 'bg-accent/15 text-accent'
                : 'text-muted hover:bg-border/50 hover:text-foreground'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto hidden p-4 md:block">
        <button
          onClick={logout}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-muted hover:border-red-500/50 hover:text-red-300"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
