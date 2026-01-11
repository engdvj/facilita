# FACILITA CHVC

Portal de links e documentos multi-empresa para ambientes corporativos.

## Estrutura do Projeto

Este repositório contém duas versões do sistema:

### V1 - Sistema Legado (Flask + React)
Sistema original em produção, localizado na raiz do repositório.
- Backend: Flask/Python
- Frontend: React/Vite
- Banco: PostgreSQL

### V2 - Nova Arquitetura (NestJS + Next.js)
Nova versão em desenvolvimento, localizada em `/v2`.
- Backend: NestJS + TypeScript + Prisma
- Frontend: Next.js 15 + Tailwind CSS
- Suporte multi-empresa nativo

**📖 [Documentação completa da V2](v2/README.md)**

## Início Rápido - V2

### Opção 1: Desenvolvimento (Terminal)

**Backend:**
```bash
cd v2/backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```
Acesse: http://localhost:3001/api

**Frontend (em outro terminal):**
```bash
cd v2/frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm run dev
```
Acesse: http://localhost:3000

### Opção 2: Docker

```bash
cd v2
cp .env.example .env
docker-compose up -d --build
```
Acesse: http://localhost

**Credenciais padrão:**
- Email: superadmin@facilita.local
- Senha: ChangeMe123!

## V1 - Instalação Legada

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
FLASK_DEBUG=0 python wsgi.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### Docker V1
```bash
docker compose up --build
```

Credenciais V1: admin/admin123

## Documentação Adicional

- [Resumo Estratégico](Resumo%20Estratégico%20do%20Projeto%20FACILITA%20CHVC.md)
- [Plano de Desenvolvimento V2](plano.md)

---

**Branch atual:** feature/facilita-v2-nestjs
**Status V2:** 🟢 Em desenvolvimento ativo
