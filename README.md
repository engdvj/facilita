# FACILITA V2

Portal corporativo multi-empresa para links, documentos e notas, com permissões granulares e administração centralizada.

## Stack
- Backend: NestJS 11, TypeScript, Prisma, PostgreSQL
- Frontend: Next.js 16, React 19, Tailwind CSS
- Infra: Redis, Nginx

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
