import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PricingSection } from '@/components/PricingSection';
import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/api';

const audiences = [
  'Agentes de IA',
  'Automações',
  'Chatbots',
  'MCP Servers',
  'LangChain / LlamaIndex',
  'SaaS builders',
  'CRMs inteligentes',
  'Assistentes corporativos',
];

const modules = [
  {
    title: 'Search',
    desc: 'Web, imagens, notícias, vídeos, shopping, mapas e locais — SERP estruturado com cache e failover.',
    status: 'Ativo',
  },
  {
    title: 'Deep Search',
    desc: 'Pesquisa multi-etapas com citações e síntese — uma chamada substitui dezenas de requests.',
    status: 'Ativo',
  },
  {
    title: 'Research',
    desc: 'Summary, fontes, pessoas, empresas e timeline — inteligência sobre o mundo em JSON.',
    status: 'Ativo',
  },
  {
    title: 'Browser',
    desc: 'Chromium automatizado: navegar, clicar, esperar e capturar — feito para agentes que agem na web.',
    status: 'Ativo',
  },
  {
    title: 'Crawl',
    desc: 'Rastreamento recursivo de sites com profundidade e domínio configuráveis.',
    status: 'Ativo',
  },
  {
    title: 'Extract',
    desc: 'HTML → markdown limpo. Screenshot e PDF incluídos para pipelines completos.',
    status: 'Ativo',
  },
  {
    title: 'RAG-ready',
    desc: 'Prepare, embeddings, RAG index/query, memory e datasets — conteúdo pronto para vector stores.',
    status: 'Ativo',
  },
  {
    title: 'MCP Server',
    desc: 'Integração zero-code para Cursor, Claude Desktop e qualquer runtime MCP.',
    status: 'Em breve',
  },
];

const integrations = [
  { name: 'MCP', desc: 'Tools oficiais para agentes' },
  { name: 'RAG', desc: 'Chunks, embeddings, index' },
  { name: 'LangChain', desc: 'Roadmap Phase 2' },
  { name: 'REST API', desc: 'OpenAPI / Swagger' },
  { name: 'SDK JS', desc: 'TypeScript nativo' },
  { name: 'PIX', desc: 'Billing brasileiro' },
];

const moat = [
  { title: 'Cache global', desc: 'Reduz custo e latência com resultados compartilhados.' },
  { title: 'Failover multi-provedor', desc: 'Se um motor falha, outro assume automaticamente.' },
  { title: 'Re-ranking por IA', desc: 'Resultados ordenados por relevância semântica.' },
  { title: 'Formato RAG-friendly', desc: 'Chunks, citações e metadados prontos para agentes.' },
];

const creditCosts = [
  { op: 'Busca web', cost: 2 },
  { op: 'Imagens / News / Vídeos', cost: 3 },
  { op: 'Shopping', cost: 4 },
  { op: 'Mapas / Locais', cost: 5 },
  { op: 'Extract / Embeddings', cost: 5 },
  { op: 'Screenshot / PDF', cost: 8 },
  { op: 'Crawl / AI Search / Agent', cost: 15 },
  { op: 'Research', cost: 25 },
  { op: 'Deep Research', cost: 60 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="grid-bg relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(34,211,165,0.08),_transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center md:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Web Intelligence Platform · Brasil
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Infraestrutura de{' '}
            <span className="gradient-text">recuperação de conhecimento para IA</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            A plataforma brasileira para conectar agentes de IA ao mundo — Search, Research,
            Crawl, Browser, RAG e MCP em uma API unificada.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-accent px-8 py-4 text-base font-bold text-background hover:bg-accent/90"
            >
              Começar grátis — 2.700 créditos de inteligência
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
            Business Launch{' '}
            <strong className="text-foreground">R$ 197 / 70k créditos</strong>
            {' · '}Avulso <strong className="text-foreground">R$ 5 / 500</strong>
          </p>
        </div>
      </section>

      <section id="audience" className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Para quem constrói agentes de IA</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Não vendemos scraping — vendemos{' '}
            <strong className="text-foreground">créditos de inteligência</strong> para o ecossistema
            de agentes, automações e produtos cognitivos.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {audiences.map((item) => (
              <span
                key={item}
                className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-sm text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Módulos de infraestrutura</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            Cada módulo é um building block para agentes recuperarem, entenderem e agirem sobre o
            mundo real.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-accent">{f.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      f.status === 'Ativo'
                        ? 'bg-accent-secondary/15 text-accent-secondary'
                        : 'bg-accent/15 text-accent'
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">Conecte do seu jeito</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-border bg-background/50 p-4 text-center"
              >
                <p className="font-semibold text-accent">{item.name}</p>
                <p className="mt-1 text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="moat" className="border-b border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Camada inteligente sobre a busca</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            O diferencial não é só preço — é a inteligência que torna cada consulta mais valiosa.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {moat.map((item) => (
              <div key={item.title}>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="credits" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Créditos de inteligência</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            Operações mais complexas consomem mais — preço justo e sustentável para pipelines de
            agentes.
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
          <h2 className="text-2xl font-bold">A AWS da recuperação de informação para IA</h2>
          <p className="mt-3 text-muted">
            Crie sua conta, pegue a API key e conecte seu agente em minutos — via REST, SDK ou MCP.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="rounded-lg bg-accent px-6 py-3 font-semibold text-background">
              Criar conta
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border px-6 py-3 font-semibold hover:border-accent"
            >
              Falar com vendas
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
