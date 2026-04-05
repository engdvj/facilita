# FACILITA V2.0 - Portal Multi-Empresa

Sistema moderno de portal de links, agendas e documentos com arquitetura multi-empresa (Company → Unit → Sector → User).

## 🎯 Funcionalidades

### Core
- ✅ **Multi-empresa**: Suporte nativo para múltiplas empresas, unidades e setores
- ✅ **Portal de Links**: Gestão de links com categorias, imagens e tags
- ✅ **Agendas/Documentos**: Upload e gerenciamento de arquivos (PDF, DOC, XLS, PPT)
- ✅ **Autenticação JWT**: Sistema seguro com refresh tokens
- ✅ **Permissões Granulares**: 5 níveis de acesso (SUPERADMIN, ADMIN, COORDINATOR, MANAGER, USER)
- ✅ **Sistema de Upload**: Validação de tipos e tamanhos de arquivos

### Recursos Avançados
- 📦 Soft delete para Links e Schedules
- 📝 Histórico de versões para Links
- 🏷️ Sistema de tags para Links e Schedules
- 👥 Controle de acesso por setor
- 📊 Contadores de uso (links, agendas por categoria)

## 🛠️ Stack Tecnológica

**Backend:**
- NestJS 11 + TypeScript
- Prisma 7 + PostgreSQL 16
- JWT Authentication
- Multer (upload de arquivos)

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Zustand (state management)
- Tailwind CSS 4
- Axios (API client com interceptors)

**Infraestrutura:**
- PostgreSQL
- Redis (cache)
- Nginx (reverse proxy)

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20+ (para desenvolvimento local)

### 1. Clone e Configure

\`\`\`bash
# Entre no diretório v2
cd v2

# Copie o arquivo de ambiente
cp .env.example .env

# Edite o .env e altere as senhas e secrets!
nano .env
\`\`\`

### 2. Acesse a Aplicação

- **Frontend**: http://localhost (via Nginx) ou http://localhost:3000 (direto)
- **Backend API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs (em breve)

### 3. Login Inicial

Use as credenciais do SUPERADMIN definidas no \`.env\`:
- **Email**: superadmin@facilita.local (padrão)
- **Senha**: ChangeMe123! (padrão)

**⚠️ IMPORTANTE: Altere essas credenciais em produção!**

## 📁 Estrutura do Projeto

\`\`\`
v2/
├── backend/
│   ├── src/
│   │   ├── auth/           # Autenticação JWT + Guards
│   │   ├── categories/     # Categorias
│   │   ├── companies/      # Empresas
│   │   ├── links/          # Portal de links
│   │   ├── sectors/        # Setores
│   │   ├── units/          # Unidades
│   │   ├── uploaded-schedules/  # Agendas/Documentos
│   │   ├── uploads/        # Sistema de upload
│   │   ├── users/          # Usuários
│   │   └── prisma/         # ORM
│   ├── prisma/
│   │   ├── schema.prisma   # Schema do banco
│   │   └── seed.ts         # Seed inicial
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/     # Páginas de autenticação
│   │   │   └── (app)/      # Páginas da aplicação
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── lib/            # Utilitários (API client)
│   │   ├── stores/         # Zustand stores
│   │   └── types/          # Tipos TypeScript
├── nginx/
│   └── nginx.conf          # Configuração do Nginx
\`\`\`

## 🔧 Desenvolvimento Local

### Backend

\`\`\`bash
cd backend

# Instale dependências
npm install

# Configure o .env
cp .env.example .env

# Execute migrations
npm run prisma:migrate

# Gere Prisma Client
npm run prisma:generate

# Inicie em desenvolvimento
npm run start:dev
\`\`\`

### Frontend

\`\`\`bash
cd frontend

# Instale dependências
npm install

# Configure o .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Inicie em desenvolvimento
npm run dev
\`\`\`

## 📝 Scripts Úteis

### Backend

\`\`\`bash
# Gerar nova migration
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Build de produção
npm run build

# Iniciar produção
npm run start:prod
\`\`\`

## 🎨 Hierarquia de Entidades

\`\`\`
Company (Empresa)
  └── Unit (Unidade/Filial)
       └── Sector (Setor/Departamento)
            └── User (Usuário)
\`\`\`

## 🔐 Níveis de Acesso

| Role         | Descrição                           | Permissões                                  |
|--------------|-------------------------------------|---------------------------------------------|
| SUPERADMIN   | Acesso total à plataforma           | Gerenciar tudo, incluindo empresas          |
| ADMIN        | Administrador da empresa            | Gerenciar sua empresa completa              |
| COORDINATOR  | Gestor de unidade                   | Gerenciar unidade e setores                 |
| MANAGER      | Gestor de setor                     | Gerenciar apenas seu setor                  |
| USER         | Usuário final                       | Visualizar e usar o portal                  |

## 🔌 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário

### Empresas
- `GET /api/companies` - Listar empresas
- `POST /api/companies` - Criar empresa (SUPERADMIN)
- `PATCH /api/companies/:id` - Atualizar empresa
- `DELETE /api/companies/:id` - Excluir empresa

### Links
- `GET /api/links?companyId=:id` - Listar links
- `POST /api/links` - Criar link
- `PATCH /api/links/:id` - Atualizar link
- `DELETE /api/links/:id` - Excluir link (soft delete)

### Agendas/Documentos
- `GET /api/schedules?companyId=:id` - Listar documentos
- `POST /api/schedules` - Criar documento
- `PATCH /api/schedules/:id` - Atualizar documento
- `DELETE /api/schedules/:id` - Excluir documento

### Upload
- `POST /api/uploads/image` - Upload de imagem
- `POST /api/uploads/document` - Upload de documento

## 🗄️ Schema do Banco (Resumo)

**Hierarquia:**
- Company
- Unit
- Sector
- User

**Portal:**
- Category
- Link
- UploadedSchedule

**Extras:**
- Favorite
- Tag
- LinkVersion
- Notification

**Sistema:**
- RolePermission
- AuditLog
- SystemConfig
- RefreshToken

## 🐛 Troubleshooting

### Frontend não conecta ao backend

1. Verifique se o backend está rodando: http://localhost:3001/api/health
2. Verifique o CORS no backend (.env: `CORS_ORIGIN=*`)
3. Verifique o NEXT_PUBLIC_API_URL no frontend

### Erro de upload de arquivos

1. Verifique se os diretórios existem: `uploads/images` e `uploads/documents`
2. Verifique permissões dos diretórios
3. Verifique o limite de tamanho no nginx (client_max_body_size: 20M)

## 📦 Próximas Funcionalidades (Roadmap)

### Milestone 3 - Funcionalidades Extras
- [ ] Sistema de Favoritos completo
- [ ] Busca Full-Text (PostgreSQL tsvector)
- [ ] Sistema de Notificações (email + in-app)
- [ ] WebSockets para atualizações em tempo real
- [ ] Feed de atividades

### Milestone 4 - Sistema
- [ ] Módulo de Backup/Restore automatizado
- [ ] Módulo de Auditoria completo
- [ ] Sistema de Reset seletivo
- [ ] Configurações persistentes (SystemConfig)
- [ ] Testes E2E

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Equipe

Desenvolvido para otimizar a gestão de informações e documentos em ambientes corporativos multi-empresa.

---

**Status**: 🟢 Em desenvolvimento ativo

**Versão**: 2.0.0-beta

**Última atualização**: Janeiro 2026
