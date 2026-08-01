# NoviqSearch — Roadmap por Fases

Complemento de [product-vision.md](./product-vision.md) com cronograma executável e proposta de monetização (Imperium XIX).

---

## Phase 1 — Reposicionamento (agora)

**Objetivo:** Sair de “API Google Search” para “Infraestrutura brasileira para agentes de IA”.

| Entrega | Status |
|---------|--------|
| Landing com nova headline e grid de módulos | ✅ |
| `docs/product-vision.md` — 23 Imperiums | ✅ |
| `docs/api-modules.md` — taxonomia de endpoints | ✅ |
| README reposicionado | ✅ |
| MCP README | ✅ |
| Manter endpoints e billing PIX intactos | ✅ |

**Não inclui:** novos verticals, migração de tiers no backend, pgvector.

---

## Phase 2 — Ecossistema agentes (próximos 90 dias)

| Prioridade | Item | Esforço |
|------------|------|---------|
| P0 | Publicar MCP no npm + docs Cursor/Claude | Médio |
| P0 | SDK JS completo (todos endpoints OpenAPI) | Médio |
| P1 | SDK Python | Médio |
| P1 | LangChain / LlamaIndex tools | Baixo |
| P1 | MCP tools: crawl, browser, memory, rag_query | Baixo |
| P2 | Scholar API (stub → MVP) | Alto |
| P2 | pgvector para RAG | Alto |
| P2 | Migrar billing UI para tiers Starter/Pro/Business | Médio |
| P2 | Alinhar `DEFAULT_FREE_CREDITS=2700` em prod | Baixo |

---

## Phase 3 — Escala e enterprise (6–12 meses)

- Hosted MCP (SSE) + OAuth
- SSO enterprise, IP allowlist, SLA
- Marketplace workflows (templates Agent API)
- APIs brasileiras (CNPJ, CEP, IBGE) no marketplace
- Re-ranking proprietário + cache semântico
- Landing internacional (EN)
- Stripe / faturamento internacional

---

## Imperium XIX — Proposta de monetização

### Princípio

Créditos são **créditos de inteligência** — unidade universal de consumo cognitivo (busca simples custa menos; deep research custa mais). Ver tabela em [billing-pricing.md](./billing-pricing.md).

### Tiers propostos (target)

| Plano | Preço | Créditos | Público |
|-------|-------|----------|---------|
| **Gratuito** | R$ 0 | **2.700** ao cadastrar | Experimentação, protótipos |
| **Starter** | R$ 39/mês | 12.000/mês | Automações, chatbots, MCP |
| **Pro** | R$ 149/mês | 50.000/mês | Agentes em produção, RAG |
| **Business** | R$ 499/mês | 200.000/mês | Times, alto volume |
| **Enterprise** | Custom | Volume + SLA | SSO, white-label, dedicated |
| **Pay-as-you-go** | R$ 5 | 500 créditos avulsos | Sem validade |

### Implementação atual vs proposta

| Aspecto | Hoje (código/prod) | Proposta Imperium XIX |
|---------|-------------------|------------------------|
| Créditos grátis | 500 default (`app.config`); **2.700** no `docker-compose` | **2.700** unificado |
| Assinatura principal | Seed: Starter/Pro/Business via PIX | Mesmos valores acima |
| Oferta legacy | **R$ 197/mês · 70.000 créditos** | Ver abaixo |

### Business Launch Offer (implementação legada)

A oferta **R$ 197/mês por 70.000 créditos** permanece documentada como **Business Launch Offer** — preço promocional de lançamento para early adopters que migraram da era “SERP API”.

**Caminho de migração sugerido:**

1. **Manter** early adopters no plano R$ 197/70k até fim do ciclo ou aviso de 90 dias.
2. **Novos clientes** entram nos tiers Starter (R$ 39) / Pro (R$ 149) / Business (R$ 499).
3. **Upgrade path:** clientes R$ 197 recebem desconto de 20% no Business (R$ 499) no primeiro ano.
4. **Landing Phase 1** destaca R$ 197/70k como oferta ativa + PAYG R$ 5/500; tiers completos no roadmap.
5. **Backend Phase 2:** plano `LAUNCH_BUSINESS` no Prisma ou flag `legacyPricing` no user.

### PAYG e overage

| Mecanismo | Valor | Status |
|-----------|-------|--------|
| Pacote avulso | R$ 5 / 500 créditos | ✅ Implementado (PIX) |
| Overage (assinantes) | R$ 5 / 500 créditos excedentes | ✅ Implementado |
| Pay-as-you-go toggle | Dashboard billing | ✅ Implementado |

---

## Métricas de sucesso por fase

### Phase 1
- Landing bounce ↓, cadastros ↑
- Docs MCP/SDK referenciados em issues/Discord

### Phase 2
- Downloads npm MCP + SDK
- % requests via Agent/Research > 15%
- 10+ integrações LangChain documentadas

### Phase 3
- MRR tiers Starter+
- 3+ contratos Enterprise
- Uptime SLA 99.9% com enterprise

---

## Dependências técnicas

| Feature | Depende de |
|---------|------------|
| Deep Research streaming | OpenAI + SSE no NestJS |
| pgvector RAG | Migration Prisma + extensão Postgres |
| Hosted MCP | Auth OAuth + infra SSE |
| Scholar | Novo parser + provider |
| Billing tiers UI | Seed plans + frontend billing sync |

---

## Links

- [Visão completa (23 Imperiums)](./product-vision.md)
- [Módulos e endpoints](./api-modules.md)
- [APIs avançadas — referência](./advanced-apis.md)
- [Billing PIX](./billing-pix.md)
- [Integrações](./integrations.md)
