import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PricingSection } from '@/components/PricingSection';
import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/api';

const features = [
  { title: 'Busca Web SERP', desc: 'Resultados estruturados do Google com fallback inteligente.' },
  { title: 'Imagens, News, Vídeos', desc: 'Endpoints dedicados para cada tipo de conteúdo.' },
  { title: 'Mapas & Locais', desc: 'Google Maps + fallback OpenStreetMap/Nominatim.' },
  { title: 'Research & AI Search', desc: 'Pesquisa com síntese de fontes e ranking por IA.' },
  { title: 'Crawl & Extract', desc: 'Rastreie sites e extraia conteúdo estruturado.' },
  { title: 'RAG & Datasets', desc: 'Indexe documentos e consulte com contexto.' },
];

const creditCosts = [
  { op: 'Busca web', cost: 2 },
  { op: 'Imagens / News / Vídeos', cost: 3 },
  { op: 'Shopping', cost: 4 },
  { op: 'Mapas / Locais', cost: 5 },
  { op: 'Extract / Dataset', cost: 5 },
  { op: 'Screenshot / PDF', cost: 8 },
  { op: 'Crawl / AI Search', cost: 15 },
  { op: 'Research', cost: 25 },
  { op: 'Deep Research', cost: 60 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="grid-bg border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center md:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
            🎁 2.700 créditos grátis ao criar conta
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            API de busca para{' '}
            <span className="gradient-text">desenvolvedores ambiciosos</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            NoviqSearch entrega resultados SERP estruturados, mapas, imagens e APIs avançadas
            de research — prontas para IA, automações e produtos SaaS.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-accent px-8 py-4 text-base font-bold text-background hover:bg-accent/90"
            >
              Começar grátis — 2.700 créditos
            </Link>
            <a
              href="https://api.noviqsearch.online/docs"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-border px-8 py-4 text-base font-semibold hover:border-accent"
            >
              Ver documentação
            </a>
          </div>
          <p className="mt-6 text-sm text-muted">
            Plano Mensal: <strong className="text-foreground">R$ 197/mês</strong> com{' '}
            <strong className="text-foreground">70.000 créditos</strong>
            {' '}· Avulso <strong className="text-foreground">R$ 5 / 500 créditos</strong>
          </p>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Tudo que sua stack precisa</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-accent">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="credits" className="border-y border-border/60 bg-card/40 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Consumo de créditos</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            Operações mais complexas consomem mais créditos — preço justo para você e sustentável para nós.
          </p>
          <div className="mx-auto mt-10 max-w-lg overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card text-left text-muted">
                <tr>
                  <th className="px-4 py-3">Operação</th>
                  <th className="px-4 py-3 text-right">Créditos</th>
                </tr>
              </thead>
              <tbody>
                {creditCosts.map((row) => (
                  <tr key={row.op} className="border-t border-border">
                    <td className="px-4 py-3">{row.op}</td>
                    <td className="px-4 py-3 text-right font-mono text-accent">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-accent/30 bg-accent/5 px-6 py-12 text-center">
          <h2 className="text-2xl font-bold">Pronto para integrar?</h2>
          <p className="mt-3 text-muted">
            Crie sua conta em 30 segundos e receba 2.700 créditos grátis.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="rounded-lg bg-accent px-6 py-3 font-semibold text-background">
              Criar conta
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="rounded-lg border border-border px-6 py-3 font-semibold hover:border-accent">
              WhatsApp comercial
            </a>
          </div>
        </div>
      </section>

      <Footer />

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl shadow-lg hover:scale-105"
        aria-label="WhatsApp"
      >
        💬
      </a>
    </div>
  );
}
