# ✅ Checklist de Implementação - Frontend

## 📍 Status Geral
- ✅ **Backend:** 100% Completo
- ⏳ **Frontend:** 0% - Aguardando implementação

---

## 🎯 Fase 1: Base (Types & Store)

### 1.1 Atualizar Types
**Arquivo:** `frontend/src/types/index.ts`

- [ ] Adicionar enum `SectorRole`
  ```typescript
  export type SectorRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  ```

- [ ] Adicionar interface `SectorUnit`
  ```typescript
  export interface SectorUnit {
    id: string;
    sectorId: string;
    unitId: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
    unit: Unit;
  }
  ```

- [ ] Adicionar interface `UserSector`
  ```typescript
  export interface UserSector {
    id: string;
    userId: string;
    sectorId: string;
    isPrimary: boolean;
    role: SectorRole;
    createdAt: string;
    updatedAt: string;
    sector: Sector & {
      sectorUnits: SectorUnit[];
    };
  }
  ```

- [ ] Atualizar interface `Sector`
  - [ ] Remover `unitId: string`
  - [ ] Remover `unit?: Unit`
  - [ ] Adicionar `sectorUnits: SectorUnit[]`
  - [ ] Adicionar `userSectors?: UserSector[]`

- [ ] Atualizar interface `User`
  - [ ] Remover `unitId?: string`
  - [ ] Remover `sectorId?: string`
  - [ ] Adicionar `userSectors: UserSector[]`

- [ ] Atualizar interface `AuthUser`
  - [ ] Remover `unitId?: string`
  - [ ] Remover `sectorId?: string`
  - [ ] Adicionar `userSectors: UserSector[]`

**Estimativa:** 15 minutos

---

### 1.2 Atualizar Auth Store
**Arquivo:** `frontend/src/stores/auth-store.ts`

- [ ] Remover campos `unitId` e `sectorId` do estado
- [ ] Adicionar campo `userSectors: UserSector[]`
- [ ] Criar helper `getUserPrimarySector(user)`
- [ ] Criar helper `getUserSectorIds(user)`
- [ ] Criar helper `getUserSectorRole(user, sectorId)`

**Estimativa:** 10 minutos

---

## 🎨 Fase 2: Componentes Reutilizáveis

### 2.1 Criar Unit Selector
**Arquivo:** `frontend/src/components/admin/unit-selector.tsx` (NOVO)

- [ ] Criar componente `UnitSelector`
- [ ] Props: `units`, `selectedUnits`, `onChange`, `companyId`
- [ ] Multi-select com checkboxes
- [ ] Radio button para marcar principal
- [ ] Filtrar por companyId
- [ ] Validação: ao menos 1 unidade selecionada
- [ ] Mensagem de erro se nenhuma selecionada

**Estimativa:** 30 minutos

---

### 2.2 Criar Sector Selector
**Arquivo:** `frontend/src/components/admin/sector-selector.tsx` (NOVO)

- [ ] Criar componente `SectorSelector`
- [ ] Props: `sectors`, `selectedSectors`, `onChange`, `companyId`
- [ ] Multi-select com checkboxes
- [ ] Radio button para marcar principal
- [ ] Dropdown de role (OWNER, ADMIN, MEMBER, VIEWER)
- [ ] Exibir unidades de cada setor
- [ ] Filtrar por companyId

**Estimativa:** 45 minutos

---

## 📝 Fase 3: Formulários

### 3.1 Atualizar Página de Setores
**Arquivo:** `frontend/src/app/(app)/admin/sectors/page.tsx`

#### Formulário (Modal)
- [ ] Atualizar interface `SectorFormData`
  - [ ] Remover `unitId: string`
  - [ ] Adicionar `units: { unitId: string; isPrimary: boolean }[]`

- [ ] Atualizar estado inicial do formulário
  ```typescript
  const [formData, setFormData] = useState({
    companyId: '',
    units: [], // NOVO
    name: '',
    description: '',
    status: 'ACTIVE'
  });
  ```

- [ ] Substituir select de unidade por `<UnitSelector />`
- [ ] Atualizar função `handleEdit()`
  ```typescript
  units: sector.sectorUnits.map(su => ({
    unitId: su.unitId,
    isPrimary: su.isPrimary
  }))
  ```

- [ ] Validar ao menos 1 unidade antes de submit

#### Display (Cards)
- [ ] Remover exibição de `sector.unit?.name`
- [ ] Adicionar exibição de `sector.sectorUnits[]`
- [ ] Mostrar badges com nome das unidades
- [ ] Indicar unidade principal com ★
- [ ] Badge azul para principal, cinza para demais

**Estimativa:** 1 hora

---

### 3.2 Atualizar Página de Usuários
**Arquivo:** `frontend/src/app/(app)/admin/users/page.tsx`

#### Formulário (Modal)
- [ ] Atualizar interface `UserFormData`
  - [ ] Remover `unitId?: string`
  - [ ] Remover `sectorId?: string`
  - [ ] Adicionar `sectors?: { sectorId: string; isPrimary: boolean; role: SectorRole }[]`

- [ ] Atualizar estado inicial do formulário
  ```typescript
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'COLLABORATOR',
    status: 'ACTIVE',
    companyId: '',
    sectors: [], // NOVO
    avatarUrl: ''
  });
  ```

- [ ] Remover selects de unidade e setor
- [ ] Adicionar `<SectorSelector />`
- [ ] Atualizar função `handleEdit()`
  ```typescript
  sectors: user.userSectors?.map(us => ({
    sectorId: us.sectorId,
    isPrimary: us.isPrimary,
    role: us.role
  })) || []
  ```

#### Display (Cards)
- [ ] Remover exibição de `user.unit` e `user.sector`
- [ ] Adicionar exibição de `user.userSectors[]`
- [ ] Mostrar badges com nome dos setores
- [ ] Exibir role de cada setor
- [ ] Indicar setor principal com ★
- [ ] Badge azul para principal, cinza para demais
- [ ] Mostrar tooltip com detalhes (unidades, role)

#### Filtros
- [ ] Atualizar interface de filtros
  - [ ] Remover `sectorId?: string`
  - [ ] Adicionar `sectorIds?: string[]`

- [ ] Substituir select de setor por multi-select
- [ ] Atualizar lógica de filtragem
  ```typescript
  if (filters.sectorIds && filters.sectorIds.length > 0) {
    const userSectorIds = user.userSectors?.map(us => us.sectorId) || [];
    if (!filters.sectorIds.some(id => userSectorIds.includes(id))) {
      return false;
    }
  }
  ```

**Estimativa:** 1h30min

---

## 🧭 Fase 4: Navegação & Dashboard

### 4.1 Atualizar Navegação
**Arquivo:** `frontend/src/components/app-nav.tsx`

- [ ] Atualizar lógica de `canAccessAdmin`
  ```typescript
  const hasAdminInAnySector = user?.userSectors?.some(
    us => us.role === 'ADMIN' || us.role === 'OWNER'
  ) || false;

  const canAccessAdmin =
    user?.role === 'ADMIN' ||
    user?.role === 'SUPERADMIN' ||
    hasAdminInAnySector;
  ```

- [ ] Adicionar exibição de setores no dropdown do usuário
- [ ] Mostrar nome do setor + role
- [ ] Indicar setor principal com ★
- [ ] Ordenar: principal primeiro

**Estimativa:** 30 minutos

---

### 4.2 Atualizar Dashboard
**Arquivo:** `frontend/src/app/(app)/dashboard/page.tsx`

- [ ] Adicionar card "Setores Multi-Unidade"
  ```typescript
  sectors.filter(s => s.sectorUnits && s.sectorUnits.length > 1).length
  ```

- [ ] Adicionar card "Usuários Multi-Setor"
  ```typescript
  users.filter(u => u.userSectors && u.userSectors.length > 1).length
  ```

- [ ] Adicionar card "Média de Setores por Usuário"
  ```typescript
  (users.reduce((acc, u) => acc + (u.userSectors?.length || 0), 0) / users.length).toFixed(1)
  ```

**Estimativa:** 20 minutos

---

## 🔐 Fase 5: Permissões

### 5.1 Atualizar Página de Permissões
**Arquivo:** `frontend/src/app/(app)/admin/permissions/page.tsx`

- [ ] Adicionar seção "Permissões Granulares por Setor"
- [ ] Adicionar toggle `useSectorRoles`
- [ ] Documentar roles:
  - **OWNER:** Acesso total ao setor
  - **ADMIN:** Pode gerenciar conteúdo e membros
  - **MEMBER:** Pode criar e editar próprio conteúdo
  - **VIEWER:** Apenas visualização

**Estimativa:** 15 minutos

---

## 🧪 Fase 6: Testes

### 6.1 Testes de Setores
- [ ] Criar setor com 1 unidade
- [ ] Criar setor com múltiplas unidades
- [ ] Marcar unidade principal
- [ ] Editar setor: adicionar unidades
- [ ] Editar setor: remover unidades
- [ ] Editar setor: trocar unidade principal
- [ ] Validar erro ao tentar criar setor sem unidades
- [ ] Verificar exibição de badges nas unidades

### 6.2 Testes de Usuários
- [ ] Criar usuário sem setores
- [ ] Criar usuário com 1 setor
- [ ] Criar usuário com múltiplos setores
- [ ] Marcar setor principal
- [ ] Definir role em cada setor
- [ ] Editar usuário: adicionar setores
- [ ] Editar usuário: remover setores
- [ ] Editar usuário: trocar setor principal
- [ ] Editar usuário: trocar role de um setor
- [ ] Verificar exibição de badges nos setores

### 6.3 Testes de Filtros
- [ ] Filtrar usuários por 1 setor
- [ ] Filtrar usuários por múltiplos setores
- [ ] Verificar que usuários com qualquer dos setores aparecem
- [ ] Limpar filtros

### 6.4 Testes de Dashboard
- [ ] Verificar contagem de setores multi-unidade
- [ ] Verificar contagem de usuários multi-setor
- [ ] Verificar cálculo de média de setores

### 6.5 Testes de Navegação
- [ ] Verificar exibição de setores no dropdown
- [ ] Verificar indicação de setor principal
- [ ] Verificar permissões baseadas em roles de setor

### 6.6 Testes de Permissões
- [ ] Ativar/desativar permissões granulares
- [ ] Verificar documentação de roles

**Estimativa total de testes:** 1 hora

---

## ⏱️ Estimativa Total

| Fase | Tempo Estimado |
|------|----------------|
| Fase 1: Base | 25 min |
| Fase 2: Componentes | 1h15min |
| Fase 3: Formulários | 2h30min |
| Fase 4: Navegação & Dashboard | 50 min |
| Fase 5: Permissões | 15 min |
| Fase 6: Testes | 1h |
| **TOTAL** | **~6 horas** |

---

## 📋 Progresso Geral

### Backend: ✅ 100%
- [x] Schema
- [x] DTOs
- [x] Services
- [x] Notificações
- [x] Documentação

### Frontend: ⏳ 0%
- [ ] Types & Store (0/6)
- [ ] Componentes (0/2)
- [ ] Formulários (0/2)
- [ ] Navegação & Dashboard (0/2)
- [ ] Permissões (0/1)
- [ ] Testes (0/6)

**Total de Tarefas:** 0/19 completas

---

## 🎯 Ordem Recomendada de Implementação

1. **Types** → Base de tudo
2. **Auth Store** → Necessário para os componentes
3. **Unit Selector** → Usado no formulário de setores
4. **Sector Selector** → Usado no formulário de usuários
5. **Formulário de Setores** → Criar/editar setores
6. **Formulário de Usuários** → Criar/editar usuários
7. **Navegação** → Exibir setores do usuário
8. **Dashboard** → Métricas
9. **Permissões** → Documentação
10. **Testes** → Validar tudo

---

## 🚀 Como Começar

```bash
# 1. Ir para o diretório do frontend
cd v2/frontend

# 2. Abrir o projeto no VS Code
code .

# 3. Iniciar com Fase 1
# Editar src/types/index.ts

# 4. Testar com o servidor de desenvolvimento
npm run dev
```

---

**Boa sorte na implementação! 🎉**
