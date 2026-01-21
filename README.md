# FACILITA V2

Portal corporativo multi-empresa para links, documentos e notas, com permissões granulares e administração centralizada.

## Stack
- Backend: NestJS 11, TypeScript, Prisma, PostgreSQL
- Frontend: Next.js 16, React 19, Tailwind CSS
- Infra: Docker Compose, Redis, Nginx

## Inicio rapido (Docker)
```bash
cd v2
# Windows:
#   init.bat
# Linux/macOS:
#   cp .env.example .env
#   # Ajuste SUPERADMIN_* e secrets
```

Windows:
```bat
init.bat
start.bat up
```

Linux/macOS:
```bash
./start.sh up
```

Ou direto com Docker Compose:
```bash
docker compose up -d --build
```

### Acessos
- Frontend: http://localhost
- API: http://localhost:3001/api
- Healthcheck: http://localhost:3001/api/health

### Login inicial
O SUPERADMIN e criado automaticamente na primeira subida do backend, usando os valores de `v2/.env`:
- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`
- `SUPERADMIN_NAME`

## Desenvolvimento local
Backend:
```bash
cd v2/backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Frontend:
```bash
cd v2/frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm run dev
```

## Estrutura
```
v2/
  backend/
  frontend/
  nginx/
  docs/
```

## Documentacao
Arquivos de planejamento e especificacoes estao em `v2/docs`.

## Observacoes
- A pagina de configuracoes depende do seed de `SystemConfig` no backend.
- Em producao, altere os secrets e credenciais do superadmin.
