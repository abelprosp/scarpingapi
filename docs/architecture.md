# Arquitetura — Serper Platform

## Visão Geral

Modular Monolith preparado para evolução em microserviços, seguindo Clean Architecture, DDD, SOLID, CQRS e Event-Driven patterns.

## Fluxo de Busca

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API NestJS
    participant R as Redis Cache
    participant Q as BullMQ
    participant P as Proxy Manager
    participant B as Browser Pool
    participant S as Search Engine
    participant PR as Parser
    participant AI as AI Service
    participant DB as PostgreSQL

    C->>A: POST /search {q, gl, hl}
    A->>A: Auth (JWT/API Key)
    A->>A: Rate Limit Check
    A->>R: Check Cache
    alt Cache Hit
        R-->>A: Cached Results
        A-->>C: Response (<1s)
    else Cache Miss
        A->>P: Get Proxy (geo-targeted)
        P-->>A: Proxy URL
        A->>B: Fetch Page (Playwright)
        B->>S: HTTP Request (anti-bot headers)
        S-->>B: HTML Response
        B-->>A: HTML Content
        A->>PR: Parse Results
        PR-->>A: Structured Data
        A->>AI: Normalize & Dedupe
        AI-->>A: Clean Results
        A->>R: Store Cache (TTL)
        A->>DB: Log Usage + Deduct Credits
        A-->>C: Response
    end
```

## Modelo ER

```mermaid
erDiagram
    User ||--o{ ApiKey : has
    User ||--o| Subscription : has
    User ||--o{ UsageLog : generates
    User ||--o{ Invoice : receives
    User ||--o{ AuditLog : triggers
    Plan ||--o{ Subscription : defines
    ApiKey ||--o{ UsageLog : used_in

    User {
        uuid id PK
        string email UK
        string passwordHash
        enum role
        int credits
        boolean isActive
    }

    ApiKey {
        uuid id PK
        uuid userId FK
        string keyHash
        string keyPrefix
        enum status
        int rateLimit
    }

    Plan {
        uuid id PK
        enum tier UK
        int priceMonthly
        int creditsMonthly
        int rateLimit
    }

    Subscription {
        uuid id PK
        uuid userId FK
        uuid planId FK
        enum status
        string stripeCustomerId
    }

    UsageLog {
        uuid id PK
        uuid userId FK
        enum searchType
        string query
        int creditsUsed
        int responseTime
        boolean cached
    }

    Proxy {
        uuid id PK
        string host
        int port
        enum type
        enum status
        string country
    }
```

## Anti-Bot Strategy

1. **User-Agent Rotation** — Pool de 5+ user agents reais
2. **Viewport Randomization** — Resoluções desktop e mobile variadas
3. **Headers Rotation** — Accept-Language, Accept, etc.
4. **Delay Inteligente** — 500-2000ms randomizado entre requests
5. **Session Pool** — Contextos Playwright reutilizáveis
6. **Captcha Detection** — Detecta reCAPTCHA e retry automático
7. **Backoff Exponencial** — 1s, 2s, 4s entre retries
8. **Proxy Rotation** — Residential/Datacenter/Mobile com failover

## Escalabilidade

- **Horizontal:** Kubernetes HPA (2-20 replicas)
- **Cache:** Redis cluster-ready
- **Queue:** BullMQ para batch/async processing
- **Database:** Connection pooling via Prisma
- **CDN:** Cloudflare-ready (Nginx reverse proxy)
