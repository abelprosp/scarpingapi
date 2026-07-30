import Link from 'next/link';
import { APP_NAME } from '@/lib/api';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
            N
          </span>
          {APP_NAME}
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#features" className="hover:text-foreground">Recursos</a>
          <a href="#pricing" className="hover:text-foreground">Planos</a>
          <a href="#credits" className="hover:text-foreground">Créditos</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-foreground">
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent/90"
          >
            Criar conta grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
