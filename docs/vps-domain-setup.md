# Domínio VPS — api.noviqsearch.online

## URLs de produção

| Recurso | URL |
|---------|-----|
| API base | `https://api.noviqsearch.online/api/v1` |
| Swagger | `https://api.noviqsearch.online/docs` |
| Health | `https://api.noviqsearch.online/api/v1/health` |

## 1. DNS

No painel do domínio `noviqsearch.online`, crie:

| Tipo | Nome | Valor |
|------|------|-------|
| A | `api` | IP da VPS (ex.: `72.61.58.208`) |

Aguarde a propagação (5–30 min).

## 2. Variáveis no `.env` da VPS

```env
API_PORT=8080
API_DOMAIN=api.noviqsearch.online
API_PUBLIC_URL=https://api.noviqsearch.online
APP_URL=https://api.noviqsearch.online
APP_NAME=Noviq Search API
CORS_ORIGIN=https://noviqsearch.online,https://api.noviqsearch.online
```

## 3. Subir a API (Docker)

```bash
git pull
docker compose up -d --build api
curl -s http://127.0.0.1:8080/api/v1/health
```

A API fica **apenas em localhost:8080** — o nginx do host expõe o domínio.

## 4. Nginx no host (recomendado)

### Primeira vez (sem SSL)

```bash
sudo mkdir -p /var/www/certbot
sudo cp docker/nginx/api.noviqsearch.online.http-only.conf /etc/nginx/sites-available/api.noviqsearch.online
sudo ln -sf /etc/nginx/sites-available/api.noviqsearch.online /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Certificado Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --webroot -w /var/www/certbot -d api.noviqsearch.online
```

### Ativar HTTPS

```bash
sudo cp docker/nginx/api.noviqsearch.online.conf /etc/nginx/sites-available/api.noviqsearch.online
sudo nginx -t && sudo systemctl reload nginx
```

## 5. Teste final

```bash
curl -s https://api.noviqsearch.online/api/v1/health | jq .
curl -s https://api.noviqsearch.online/api/v1/status | jq .
```

Abra no navegador: `https://api.noviqsearch.online/docs`

## Alternativa: nginx do Docker Compose

Se a porta 80 estiver livre na VPS:

```bash
docker compose --profile bundled-nginx up -d --build
```

O `docker/nginx/nginx.conf` já usa `server_name api.noviqsearch.online`.
Para HTTPS com nginx em container, configure certificados manualmente ou use o nginx do host (recomendado).

## Renovação SSL

```bash
sudo certbot renew --dry-run
```

Certbot costuma configurar cron automático.

## Frontend (noviqsearch.online)

O container `web` expõe o Next.js em `127.0.0.1:3080` por padrão (`WEB_PORT=3080` no `.env`).

```bash
docker compose up -d --build web
sudo cp docker/nginx/noviqsearch.online.conf /etc/nginx/sites-available/noviqsearch.online
sudo ln -sf /etc/nginx/sites-available/noviqsearch.online /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Conflito de porta

Se `docker compose up` falhar com *port is already allocated*:

```bash
sudo ss -tlnp | grep 3080
docker ps
```

- **Correção rápida:** pare o processo/container que ocupa a porta, ou defina `WEB_PORT=<porta livre>` no `.env`, ajuste `proxy_pass` em `docker/nginx/noviqsearch.online.conf` para a mesma porta, recarregue o nginx e suba de novo: `docker compose up -d web`.
- Grafana (profile `monitoring`) usa `127.0.0.1:3001` — evite reutilizar `3001` para o frontend.
