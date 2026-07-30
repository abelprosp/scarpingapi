import { APP_NAME, WHATSAPP_URL } from '@/lib/api';

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold">{APP_NAME}</p>
          <p className="mt-1 text-sm text-muted">API de busca e dados web para desenvolvedores.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <a href="https://api.noviqsearch.online/docs" target="_blank" rel="noreferrer" className="hover:text-accent">
            Documentação API
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-accent">
            WhatsApp
          </a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4 text-xs text-muted">
        © {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
      </p>
    </footer>
  );
}
