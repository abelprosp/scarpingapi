# Domínio VPS — noviqsearch.online

## URLs de produção

| Recurso | URL |
|---------|-----|
| Frontend | `https://noviqsearch.online` |
| API base | `https://api.noviqsearch.online/api/v1` |
| Swagger | `https://api.noviqsearch.online/docs` |
| Health | `https://api.noviqsearch.online/api/v1/health` |

## 1. DNS

No painel do domínio `noviqsearch.online`, crie:

| Tipo | Nome | Valor |
|------|------|-------|
| A | `@` | IP da VPS (ex.: `72.61.58.208`) |
| A | `www` | IP da VPS |
| A | `api` | IP da VPS |

Aguarde a propagação (5–30 min).

## 2. Variáveis no `.env` da VPS

```env
API_PORT=8080
WEB_PORT=3080
API_DOMAIN=api.noviqsearch.online
API_PUBLIC_URL=https://api.noviqsearch.online
APP_URL=https://api.noviqsearch.online
APP_NAME=Noviq Search API
CORS_ORIGIN=https://noviqsearch.online,https://api.noviqsearch.online
```

## 3. Subir os containers (Docker)

```bash
git pull
docker compose up -d --build api web
curl -s http://127.0.0.1:8080/api/v1/health
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3080
```

A API fica em **localhost:8080** e o frontend em **localhost:3080** — o nginx do host expõe os domínios.

## 4. Nginx no host — ordem correta (HTTP → certbot → HTTPS)

> **Importante:** nunca copie os arquivos `*.conf` (HTTPS) antes de emitir o certificado Let's Encrypt. Use sempre os `*.http-only.conf` na primeira vez.

### 4.1 Preparar diretório do certbot

```bash
sudo mkdir -p /var/www/certbot
```

### 4.2 Primeira vez — HTTP only (ambos os domínios)

```bash
sudo cp docker/nginx/api.noviqsearch.online.http-only.conf /etc/nginx/sites-available/api.noviqsearch.online
sudo ln -sf /etc/nginx/sites-available/api.noviqsearch.online /etc/nginx/sites-enabled/

sudo cp docker/nginx/noviqsearch.online.http-only.conf /etc/nginx/sites-available/noviqsearch.online
sudo ln -sf /etc/nginx/sites-available/noviqsearch.online /etc/nginx/sites-enabled/

sudo nginx -t && sudo systemctl reload nginx
```

### 4.3 Certificados Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot certonly --webroot -w /var/www/certbot -d api.noviqsearch.online
sudo certbot certonly --webroot -w /var/www/certbot -d noviqsearch.online -d www.noviqsearch.online
```

### 4.4 Ativar HTTPS (substituir configs HTTP-only)

```bash
sudo cp docker/nginx/api.noviqsearch.online.conf /etc/nginx/sites-available/api.noviqsearch.online
sudo cp docker/nginx/noviqsearch.online.conf /etc/nginx/sites-available/noviqsearch.online
sudo nginx -t && sudo systemctl reload nginx
```

## 5. Teste final

```bash
curl -s https://api.noviqsearch.online/api/v1/health | jq .
curl -s -o /dev/null -w '%{http_code}\n' https://noviqsearch.online
```

Abra no navegador:

- `https://noviqsearch.online`
- `https://api.noviqsearch.online/docs`

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

## Conflito de porta

Se `docker compose up` falhar com *port is already allocated*:

```bash
sudo ss -tlnp | grep -E '8080|3080'
docker ps
```

- **Correção rápida:** pare o processo/container que ocupa a porta, ou defina `WEB_PORT=<porta livre>` no `.env`, ajuste `proxy_pass` nos arquivos nginx para a mesma porta, recarregue o nginx e suba de novo: `docker compose up -d web`.
- Grafana (profile `monitoring`) usa `127.0.0.1:3001` — evite reutilizar `3001` para o frontend.

## Corrigir erro "certificate ... No such file or directory"

Se o nginx falhar ao recarregar porque o certificado ainda não existe, volte temporariamente para HTTP-only:

```bash
sudo cp docker/nginx/noviqsearch.online.http-only.conf /etc/nginx/sites-available/noviqsearch.online
sudo nginx -t && sudo systemctl reload nginx
sudo certbot certonly --webroot -w /var/www/certbot -d noviqsearch.online -d www.noviqsearch.online
sudo cp docker/nginx/noviqsearch.online.conf /etc/nginx/sites-available/noviqsearch.online
sudo nginx -t && sudo systemctl reload nginx
```
