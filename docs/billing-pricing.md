# Billing NoviqSearch — Preços e consumo

## Planos

| Plano | Preço | Créditos |
|-------|-------|----------|
| Gratuito | R$ 0 | 500 ao cadastrar |
| Starter | R$ 39/mês | 12.000/mês |
| Pro | R$ 149/mês | 50.000/mês |
| Business | R$ 499/mês | 200.000/mês |
| Enterprise | Personalizado | Volume / SLA / white-label |
| Avulso | R$ 5 | 500 créditos (sem validade) |

## Consumo por operação

| Operação | Créditos |
|----------|----------|
| Busca web | 2 |
| Imagens / News / Vídeos | 3 |
| Shopping / Reverse image | 4 |
| Mapas / Locais | 5 |
| Extract / Embeddings / Prepare / Memory | 5 |
| Screenshot / PDF / RAG query | 8 |
| Browser | 10 |
| Crawl / AI Search / Agent / RAG index | 15 |
| Research | 25 |
| Deep Research | 60 |

## Lógica de débito

### Usuário sem assinatura
Consome do saldo `credits` (trial 500 + pacotes avulsos).

### Assinante (Starter / Pro / Business)
1. Consome a franquia mensal.
2. Depois consome créditos avulsos.
3. Se pay-as-you-go ativo e franquia + saldo esgotados → blocos de 500 créditos a R$ 5 via PIX.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/billing/plans` | Listar planos |
| GET | `/billing/profile` | Saldo e uso |
| PATCH | `/billing/pay-as-you-go` | Ativar PAYG |
| POST | `/billing/pix/subscribe` | PIX assinatura (`{ "tier": "STARTER" \| "PRO" \| "ENTERPRISE" }`) |
| POST | `/billing/pix/buy-credits` | PIX pacote |
| POST | `/billing/pix/overage` | PIX overage |

## Variáveis

```env
DEFAULT_FREE_CREDITS=500
CREDIT_PACK_PRICE_CENTS=500
CREDIT_PACK_CREDITS=500
OVERAGE_BLOCK_CREDITS=500
```
