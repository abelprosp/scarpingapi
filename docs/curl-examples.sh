#!/usr/bin/env bash
# =============================================================================
# Serper Platform — exemplos curl para todos os endpoints
# =============================================================================
#
# Uso:
#   export BASE_URL="http://72.61.58.208:8080/api/v1"
#   export TOKEN="seu_access_token"
#   export API_KEY="sk_sua_api_key"
#
# Obter token:
#   curl -s -X POST "$BASE_URL/auth/login" \
#     -H "Content-Type: application/json" \
#     -d '{"email":"admin@serper.local","password":"Admin@123"}' | jq -r .accessToken
#
# Swagger: ${BASE_URL%/api/v1}/docs
# =============================================================================

BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"
TOKEN="${TOKEN:-}"
API_KEY="${API_KEY:-}"

auth_header() {
  if [ -n "$API_KEY" ]; then
    echo "X-API-Key: $API_KEY"
  elif [ -n "$TOKEN" ]; then
    echo "Authorization: Bearer $TOKEN"
  else
    echo "# ERRO: defina TOKEN ou API_KEY"
  fi
}

# =============================================================================
# HEALTH (sem autenticação)
# =============================================================================

# GET /health — Health check
curl -s "$BASE_URL/health" | jq .

# GET /status — Status da plataforma
curl -s "$BASE_URL/status" | jq .

# GET /metrics — Métricas Prometheus (sem auth)
curl -s "${BASE_URL%/api/v1}/api/v1/metrics"

# =============================================================================
# AUTH
# =============================================================================

# POST /auth/register — Registrar usuário
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "SuaSenha123!",
    "name": "Usuário Teste"
  }' | jq .

# POST /auth/login — Login (retorna accessToken)
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@serper.local",
    "password": "Admin@123"
  }' | jq .

# GET /auth/me — Perfil do usuário autenticado
curl -s "$BASE_URL/auth/me" \
  -H "$(auth_header)" | jq .

# =============================================================================
# API KEYS
# =============================================================================

# POST /api-keys — Criar API Key
curl -s -X POST "$BASE_URL/api-keys" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "name": "Production Key",
    "rateLimit": 100
  }' | jq .

# GET /api-keys — Listar API Keys
curl -s "$BASE_URL/api-keys" \
  -H "$(auth_header)" | jq .

# DELETE /api-keys/:id — Revogar API Key
curl -s -X DELETE "$BASE_URL/api-keys/UUID_DA_CHAVE" \
  -H "$(auth_header)" | jq .

# =============================================================================
# SEARCH — Busca
# =============================================================================

# POST /search — Pesquisa web
curl -s -X POST "$BASE_URL/search" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "nestjs typescript tutorial",
    "gl": "br",
    "hl": "pt",
    "num": 10
  }' | jq .

# POST /images — Pesquisa de imagens
curl -s -X POST "$BASE_URL/images" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "paisagem serra gaucha",
    "gl": "br",
    "hl": "pt",
    "num": 10,
    "size": "large"
  }' | jq .

# POST /news — Pesquisa de notícias
curl -s -X POST "$BASE_URL/news" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "inteligência artificial brasil",
    "gl": "br",
    "hl": "pt",
    "num": 10,
    "tbs": "w"
  }' | jq .

# POST /shopping — Pesquisa shopping
curl -s -X POST "$BASE_URL/shopping" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "notebook dell 16gb",
    "gl": "br",
    "hl": "pt",
    "num": 10
  }' | jq .

# POST /videos — Pesquisa de vídeos
curl -s -X POST "$BASE_URL/videos" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "tutorial nestjs",
    "gl": "br",
    "hl": "pt",
    "num": 10
  }' | jq .

# POST /maps — Pesquisa em mapas (Google Maps + fallback Nominatim/OSM)
curl -s -X POST "$BASE_URL/maps" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "restaurantes lajeado rs",
    "gl": "br",
    "hl": "pt",
    "num": 10,
    "lat": -29.4669,
    "lng": -51.9614,
    "radius": 5000,
    "noCache": true
  }' | jq .

# POST /places — Pesquisa de locais (Google Maps + fallback Nominatim/OSM)
curl -s -X POST "$BASE_URL/places" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "hotéis lajeado",
    "gl": "br",
    "hl": "pt",
    "placeType": "hotel",
    "lat": -29.4669,
    "lng": -51.9614,
    "radius": 8000,
    "num": 10
  }' | jq .

# POST /autocomplete — Autocomplete
curl -s -X POST "$BASE_URL/autocomplete" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "nest",
    "gl": "br",
    "hl": "pt"
  }' | jq .

# POST /related-searches — Pesquisas relacionadas
curl -s -X POST "$BASE_URL/related-searches" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "api busca google",
    "gl": "br",
    "hl": "pt"
  }' | jq .

# POST /knowledge-graph — Knowledge Graph
curl -s -X POST "$BASE_URL/knowledge-graph" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "Lajeado Rio Grande do Sul",
    "gl": "br",
    "hl": "pt"
  }' | jq .

# POST /reverse-image — Busca reversa de imagem
curl -s -X POST "$BASE_URL/reverse-image" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "url": "https://example.com/imagem.jpg",
    "gl": "br",
    "hl": "pt"
  }' | jq .

# POST /batch — Busca em lote
curl -s -X POST "$BASE_URL/batch" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "queries": [
      { "type": "web", "q": "editais lajeado", "gl": "br", "hl": "pt" },
      { "type": "news", "q": "tecnologia brasil", "gl": "br", "hl": "pt" }
    ]
  }' | jq .

# GET /credits — Créditos disponíveis
curl -s "$BASE_URL/credits" \
  -H "$(auth_header)" | jq .

# GET /usage — Histórico de uso
curl -s "$BASE_URL/usage" \
  -H "$(auth_header)" | jq .

# =============================================================================
# ADVANCED APIs
# =============================================================================

# GET /capabilities — Listar APIs avançadas
curl -s "$BASE_URL/capabilities" \
  -H "$(auth_header)" | jq .

# POST /crawl — Crawl API
curl -s -X POST "$BASE_URL/crawl" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "url": "https://example.com",
    "maxDepth": 2,
    "maxPages": 20
  }' | jq .

# POST /extract — Extract API
curl -s -X POST "$BASE_URL/extract" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "url": "https://example.com/article",
    "includeLinks": true,
    "includeMetadata": true
  }' | jq .

# POST /screenshot — Screenshot API
curl -s -X POST "$BASE_URL/screenshot" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "url": "https://example.com",
    "fullPage": false,
    "width": 1920,
    "height": 1080
  }' | jq .

# POST /pdf — PDF API
curl -s -X POST "$BASE_URL/pdf" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "url": "https://example.com/report",
    "generateFromHtml": true
  }' | jq .

# POST /research — Research API
curl -s -X POST "$BASE_URL/research" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "query": "mercado imobiliário lajeado 2026",
    "gl": "br",
    "hl": "pt",
    "numSources": 10
  }' | jq .

# POST /ai-search — AI Search API
curl -s -X POST "$BASE_URL/ai-search" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "q": "melhor CRM para startups",
    "gl": "br",
    "hl": "pt",
    "num": 10,
    "instructions": "priorizar soluções brasileiras"
  }' | jq .

# POST /deep-research — Deep Research API
curl -s -X POST "$BASE_URL/deep-research" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "query": "impacto da IA no mercado imobiliário brasileiro",
    "steps": 3,
    "gl": "br",
    "hl": "pt"
  }' | jq .

# POST /dataset/create — Criar dataset
curl -s -X POST "$BASE_URL/dataset/create" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "name": "imoveis-lajeado",
    "description": "Base de imóveis em Lajeado",
    "isPublic": false
  }' | jq .

# POST /dataset/:name/ingest — Ingerir registros no dataset
curl -s -X POST "$BASE_URL/dataset/imoveis-lajeado/ingest" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "records": [
      { "bairro": "Igrejinha", "quartos": 2, "preco": 320000, "area_m2": 54 },
      { "bairro": "Centro", "quartos": 3, "preco": 450000, "area_m2": 85 }
    ]
  }' | jq .

# POST /dataset/query — Consultar dataset
curl -s -X POST "$BASE_URL/dataset/query" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "dataset": "imoveis-lajeado",
    "filter": { "bairro": "Igrejinha", "quartos": 2 },
    "limit": 50
  }' | jq .

# POST /rag/index — Indexar documento RAG
curl -s -X POST "$BASE_URL/rag/index" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "collection": "docs-produto",
    "content": "A API usa autenticação via JWT Bearer token ou header X-API-Key. Todos os endpoints de busca são POST.",
    "metadata": { "source": "manual", "version": "1.0" }
  }' | jq .

# POST /rag/query — Busca vetorial RAG
curl -s -X POST "$BASE_URL/rag/query" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "collection": "docs-produto",
    "query": "Como autenticar na API?",
    "topK": 5
  }' | jq .

# POST /browser/navigate — Browser API (agentes)
curl -s -X POST "$BASE_URL/browser/navigate" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "url": "https://example.com/login",
    "actions": [
      { "type": "fill", "selector": "#email", "value": "user@test.com" },
      { "type": "fill", "selector": "#password", "value": "secret" },
      { "type": "click", "selector": "button[type=submit]" },
      { "type": "wait", "wait": 2000 }
    ]
  }' | jq .

# =============================================================================
# BILLING
# =============================================================================

# GET /billing/plans — Listar planos (público)
curl -s "$BASE_URL/billing/plans" | jq .

# POST /billing/checkout — Criar sessão Stripe
curl -s -X POST "$BASE_URL/billing/checkout" \
  -H "Content-Type: application/json" \
  -H "$(auth_header)" \
  -d '{
    "planId": "UUID_DO_PLANO"
  }' | jq .

# GET /billing/invoices — Listar faturas
curl -s "$BASE_URL/billing/invoices" \
  -H "$(auth_header)" | jq .

# POST /billing/webhook — Webhook Stripe (uso interno Stripe)
# curl -s -X POST "$BASE_URL/billing/webhook" \
#   -H "Content-Type: application/json" \
#   -H "stripe-signature: whsec_..." \
#   -d @stripe-event.json

# =============================================================================
# DASHBOARD (requer role ADMIN ou SUPER_ADMIN)
# =============================================================================

# GET /dashboard/overview — Visão geral
curl -s "$BASE_URL/dashboard/overview" \
  -H "$(auth_header)" | jq .

# GET /dashboard/users — Listar usuários
curl -s "$BASE_URL/dashboard/users?page=1&limit=20" \
  -H "$(auth_header)" | jq .

# GET /dashboard/usage-by-endpoint — Uso por endpoint
curl -s "$BASE_URL/dashboard/usage-by-endpoint?days=7" \
  -H "$(auth_header)" | jq .

# GET /dashboard/latency-heatmap — Mapa de calor de latência
curl -s "$BASE_URL/dashboard/latency-heatmap" \
  -H "$(auth_header)" | jq .

# GET /dashboard/audit-logs — Logs de auditoria
curl -s "$BASE_URL/dashboard/audit-logs?page=1&limit=50" \
  -H "$(auth_header)" | jq .

# =============================================================================
# FLUXO COMPLETO — login + busca em um comando
# =============================================================================

# export BASE_URL="http://72.61.58.208:8080/api/v1"
# TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
#   -H "Content-Type: application/json" \
#   -d '{"email":"admin@serper.local","password":"Admin@123"}' \
#   | jq -r .accessToken)
#
# curl -s -X POST "$BASE_URL/search" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{"q":"editais abertos lajeado","gl":"br","hl":"pt","num":5}' | jq .
