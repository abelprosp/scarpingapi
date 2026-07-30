# Billing NoviqSearch — Preços e consumo

## Planos

| Plano | Preço | Créditos |
|-------|-------|----------|
| Teste Grátis | R$ 0 | 2.700 ao cadastrar |
| Plano Mensal | R$ 197/mês | 70.000/mês (renovação) |
| Avulso | R$ 5 | 500 créditos (sem validade) |

## Consumo por operação

| Operação | Créditos |
|----------|----------|
| Busca web | 2 |
| Imagens / News / Vídeos | 3 |
| Mapas / Locais | 5 |
| Research | 25 |
| Deep Research | 60 |

## Lógica de débito

### Usuário sem assinatura
Consome do saldo `credits` (trial 2.700 + pacotes avulsos comprados).

### Assinante Plano Mensal (STARTER)
1. Primeiro consome a **franquia mensal** (`monthlyCreditsUsed` até 70.000).
2. Depois consome **créditos avulsos** do saldo `credits`.
3. Se **pay-as-you-go** estiver ativo e franquia + saldo esgotados:
   - Acumula em `overageCreditsPending`.
   - A cada **500 créditos** de overage → cobrança **R$ 5** via PIX.
   - Bloqueia novo overage até pagar o bloco pendente.

### Pay-as-you-go
Ative em `PATCH /billing/pay-as-you-go` com `{ "enabled": true }`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/billing/profile` | Saldo, uso mensal, overage, PIX pendentes |
| PATCH | `/billing/pay-as-you-go` | Ativar/desativar consumo avulso |
| POST | `/billing/pix/subscribe` | PIX plano R$ 197 |
| POST | `/billing/pix/buy-credits` | PIX pacote R$ 5/500 |
| POST | `/billing/pix/overage` | PIX overage pendente |
| GET | `/users/me/billing-status` | Status detalhado |

## Variáveis de ambiente

```env
DEFAULT_FREE_CREDITS=2700
CREDIT_PACK_PRICE_CENTS=500
CREDIT_PACK_CREDITS=500
OVERAGE_BLOCK_CREDITS=500
```
