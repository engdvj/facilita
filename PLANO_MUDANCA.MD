# Plano de Implementação – Facilita v2/Frontend

## Contexto

O projeto de referência (docflow/StudyFlow) foi analisado para extrair padrões visuais e de UX aplicáveis ao Facilita. As quatro funcionalidades abaixo estão parcialmente implementadas ou com CSS já definido mas não utilizado. O objetivo é completar a implementação de forma consistente com os padrões do projeto atual.

**Decisões tomadas:**
- Menu de perfil: substituir avatar/logout da topbar pelo footer da sidebar (o avatar some da topbar; acesso ao perfil fica no rodapé da nav)
- Páginas admin: corrigir inconsistências visuais mantendo Tailwind inline (sem migrar para `fac-*`)
- Tema (light/dark): mover para `useUiStore` para eliminar prop drilling

**Projeto:** `c:\Users\HGVC\Documents\GitHub\facilita\v2\frontend`
**Branch ativa:** `individual`

---

## ORDEM DE EXECUÇÃO

1. **Design System (base)** — tokens e classes utilitárias no `globals.css`
2. **Menu Lateral** — cabeçalho interno + labels de grupo no `app-nav.tsx`
3. **Tema na Store** — mover theme state para `useUiStore`
4. **Menu de Perfil** — footer da sidebar + popover, remoção da topbar
5. **Dashboard** — hierarquia visual e barras de progresso
6. **Auditoria visual admin pages** — consistência visual sem migrar classes

---

## ETAPA 1 — Design System: Tokens e Classes Utilitárias

**Arquivo:** `src/app/globals.css`

### 1.1 — Adicionar tokens de animação no `:root`

Inserir ao final do bloco `:root { ... }` (após `--sidebar-ring: #cabca5;`):

```css
/* Animation tokens */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
```

### 1.2 — Adicionar keyframes globais

Inserir após o bloco `@layer base { ... }`, antes de `@layer utilities { ... }`:

```css
@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 1.3 — Adicionar classes utilitárias de estado

Inserir dentro do bloco `@layer utilities { ... }`, após a definição de `.fac-filter-button`:

```css
.fac-empty-state {
  @apply fac-panel px-6 py-10 text-center text-[14px] text-muted-foreground;
}

.fac-loading-state {
  @apply fac-panel px-6 py-10 text-center text-[14px] text-muted-foreground;
}

.fac-error-state {
  @apply fac-panel border-destructive/40 bg-destructive/5 px-6 py-4 text-[14px] text-destructive;
}
```

### 1.4 — Adicionar transição de collapse na sidebar

No bloco `@layer utilities { ... }`, localizar a regra `.fac-main-grid` e adicionar a propriedade `transition` a ela:

```css
/* Adicionar transition à regra existente .fac-main-grid */
transition: grid-template-columns var(--duration-slow) var(--ease-smooth);
```

**Atenção:** Não duplicar a regra `.fac-main-grid`. Apenas acrescentar o `transition` à regra já existente.

### Checklist Etapa 1
- [x] Tokens `--ease-*` e `--duration-*` adicionados ao `:root`
- [x] `@keyframes popIn` e `@keyframes fadeUp` definidos (após `@layer base`, antes de `@layer utilities`)
- [x] Classes `.fac-empty-state`, `.fac-loading-state`, `.fac-error-state` criadas dentro de `@layer utilities`
- [x] Transição de `grid-template-columns` adicionada à regra `.fac-main-grid` existente
- [x] Verificar que `@media (prefers-reduced-motion: reduce)` no final do arquivo ainda cobre tudo com `animation: none !important`

---

## ETAPA 2 — Menu Lateral: Cabeçalho Interno e Labels de Grupo

**Arquivo:** `src/components/app-nav.tsx`

### Contexto atual

O componente aceita as props `collapsed` e `onToggleCollapse`, mas:
- Não renderiza nenhum cabeçalho interno (brand + botão de collapse)
- Não renderiza os labels de grupo (a prop `group.label` existe mas não é usada no JSX)
- O CSS `.fac-nav-head`, `.fac-nav-brand`, `.fac-nav-collapse`, `.fac-nav-label` já existe em `globals.css` — só precisa ser usado

### 2.1 — Verificar imports existentes

Os ícones `ChevronLeft` e `ChevronRight` já estão importados no arquivo. Confirmar antes de adicionar duplicatas.

### 2.2 — Adicionar cabeçalho interno (`fac-nav-head`)

No JSX do componente, dentro do `<div className="fac-nav-panel" ...>`, adicionar como **primeiro filho** (antes de `fac-nav-sections`):

```tsx
<div className="fac-nav-head">
  {!collapsed && (
    <span className="fac-nav-brand">Facilita</span>
  )}
  {onToggleCollapse && (
    <button
      type="button"
      onClick={onToggleCollapse}
      className="fac-nav-collapse"
      aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
      title={collapsed ? 'Expandir' : 'Recolher'}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </button>
  )}
</div>
```

### 2.3 — Adicionar labels de grupo

Dentro do `.map((group) => ...)`, dentro do `<section key={group.label} className="fac-nav-group">`, antes da tag `<nav className="fac-nav-list">`, adicionar:

```tsx
{!collapsed && (
  <p className="fac-nav-label">{group.label}</p>
)}
```

### 2.4 — Remover o botão de collapse do rodapé do `app-shell.tsx`

**Arquivo:** `src/components/app-shell.tsx`

Localizar e **remover** o bloco condicional do botão de toggle no `<footer>`:

```tsx
{user ? (
  <button
    type="button"
    onClick={toggleNav}
    className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground dark:bg-secondary/70 dark:hover:bg-secondary"
    aria-label={navCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
    title={navCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
  >
    {navCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
  </button>
) : <span />}
```

Substituir por simplesmente `<span />` para manter o layout do footer com o copyright centralizado.

### Checklist Etapa 2
- [x] Cabeçalho interno `fac-nav-head` adicionado como primeiro filho do `fac-nav-panel`
- [x] Brand name "Facilita" visível quando expandido, oculto quando collapsed
- [x] Botão collapse com `ChevronLeft`/`ChevronRight` implementado
- [x] Labels de grupo renderizados ("Navegacao", "Portal", "Cadastros")
- [x] Labels ocultos quando collapsed
- [x] Botão de collapse removido do footer do `app-shell.tsx`
- [x] Testar: colapso e expansão funcionam
- [x] Testar: em mobile (lg:hidden), o sidebar não é afetado

---

## ETAPA 3 — Mover Tema para `useUiStore`

**Arquivos:** `src/stores/ui-store.ts` e `src/components/app-shell.tsx`

### 3.1 — Adicionar theme ao `useUiStore`

**Arquivo:** `src/stores/ui-store.ts`

Ler o arquivo atual para verificar a assinatura exata do `create()` (se usa `get` ou não). Em seguida:

Adicionar ao type `UiState`:
```typescript
theme: 'light' | 'dark';
setTheme: (t: 'light' | 'dark') => void;
toggleTheme: () => void;
```

Adicionar à implementação do store (usar `set` com callback para evitar dependência de `get`):
```typescript
theme: (() => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (stored === 'dark' || (stored !== 'light' && prefersDark) ? 'dark' : 'light') as 'light' | 'dark';
})(),

setTheme: (t) => {
  localStorage.setItem('theme', t);
  document.documentElement.classList.toggle('dark', t === 'dark');
  set({ theme: t });
},

toggleTheme: () => set((state) => {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  document.documentElement.classList.toggle('dark', next === 'dark');
  return { theme: next };
}),
```

### 3.2 — Atualizar `app-shell.tsx` para usar store

**Arquivo:** `src/components/app-shell.tsx`

**Remover:**
```typescript
// Remover função:
const getInitialTheme = (): 'light' | 'dark' => { ... };

// Remover state local:
const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

// Remover função:
const toggleTheme = () => { ... };
```

**Adicionar** (junto aos outros selectors do `useUiStore` ou `useAuthStore`):
```typescript
const theme = useUiStore((state) => state.theme);
const toggleTheme = useUiStore((state) => state.toggleTheme);
```

**Nas props para `AppHeader`:** remover `theme={theme} onToggleTheme={toggleTheme}` (será tratado na Etapa 4).

### Checklist Etapa 3
- [x] `theme`, `setTheme`, `toggleTheme` adicionados ao `useUiStore`
- [x] Inicialização lê `localStorage` e `prefers-color-scheme` corretamente com guard `typeof window !== 'undefined'`
- [x] Estado local de tema removido de `app-shell.tsx`
- [ ] `app-shell.tsx` usa `useUiStore` para `theme` e `toggleTheme`
- [x] Toggle de tema aplica/remove a classe `dark` no `documentElement` corretamente

---

## ETAPA 4 — Menu de Perfil: Footer da Sidebar + Remoção da Topbar

### 4.1 — Criar componente `UserNavMenu`

**Novo arquivo:** `src/components/user-nav-menu.tsx`

Este componente renderiza o chip de perfil no footer da sidebar e o popover de ações.

**Props:**
```typescript
type UserNavMenuProps = {
  collapsed?: boolean;
  onOpenProfile: () => void;
};
```

**Imports:**
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Moon, Sun, UserRound } from 'lucide-react';
import UserAvatar from '@/components/user-avatar';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
```

**Estrutura JSX:**
```tsx
export default function UserNavMenu({ collapsed, onOpenProfile }: UserNavMenuProps) {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await api.post('/auth/logout');
    } catch {
      // ignorar erros de logout
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  if (!user) return null;

  const roleLabel = user.role === 'SUPERADMIN' ? 'Super Admin' : 'Usuário';

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fac-nav-footer-btn"
        aria-label="Menu do perfil"
      >
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="truncate text-[13px] font-medium text-foreground">
              {user.name || 'Usuário'}
            </span>
            <span className="text-[11px] text-muted-foreground">{roleLabel}</span>
          </div>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          className="absolute bottom-[calc(100%+8px)] left-0 z-50 min-w-[220px] rounded-[16px] border border-border bg-card p-2 shadow-[0_8px_32px_rgba(0,0,0,0.14)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          style={{ animation: 'popIn var(--duration-slow) var(--ease-spring) both' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-2">
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground">
                {user.name || 'Usuário'}
              </p>
              <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
            </div>
          </div>

          <div className="my-1 border-t border-border" />

          {/* Ações */}
          <button
            type="button"
            onClick={() => { setOpen(false); onOpenProfile(); }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
          >
            <UserRound className="h-4 w-4 shrink-0" />
            Editar Perfil
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>

          <div className="my-1 border-t border-border" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-destructive hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
```

### 4.2 — Integrar `UserNavMenu` em `app-nav.tsx`

**Arquivo:** `src/components/app-nav.tsx`

Adicionar a prop `onOpenProfile` ao tipo `AppNavProps`:
```typescript
type AppNavProps = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenProfile?: () => void;
};
```

Adicionar import:
```typescript
import UserNavMenu from '@/components/user-nav-menu';
```

Adicionar como **último filho** do `<div className="fac-nav-panel" ...>`, após o `fac-nav-sections`, **apenas se usuário logado**:
```tsx
{user && (
  <div className="fac-nav-footer">
    <UserNavMenu
      collapsed={collapsed}
      onOpenProfile={onOpenProfile ?? (() => {})}
    />
  </div>
)}
```

**Verificação CSS:** A regra `.fac-shell-with-nav .fac-nav-panel` já tem `lg:flex lg:flex-col` e `.fac-shell-with-nav .fac-nav-sections` já tem `lg:flex-1`. Isso garante que o footer gruda no fundo. Confirmar que `fac-nav-footer` tem `display: flex` — a regra atual em `globals.css` é `items-center justify-center border-t border-border px-3 py-3`, que não inclui `flex`. Adicionar `@apply flex` à classe `.fac-nav-footer` em `globals.css` se necessário.

### 4.3 — Atualizar `app-shell.tsx`

**Arquivo:** `src/components/app-shell.tsx`

Adicionar state e import:
```typescript
import UserProfileModal from '@/components/user-profile-modal';
// ...
const [profileOpen, setProfileOpen] = useState(false);
```

Atualizar a chamada do `AppNav` (dentro do `<aside>`):
```tsx
<AppNav
  collapsed={navCollapsed}
  onToggleCollapse={toggleNav}
  onOpenProfile={() => setProfileOpen(true)}
/>
```

Adicionar o modal antes do `</div>` de fechamento do container principal:
```tsx
{user && (
  <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
)}
```

### 4.4 — Simplificar `app-header.tsx`

**Arquivo:** `src/components/app-header.tsx`

**Remover completamente:**
- Tipo `AppHeaderProps` (ou esvaziar: `type AppHeaderProps = Record<string, never>`)
- Props `theme` e `onToggleTheme` da assinatura da função
- Import de `Moon` e `Sun`
- Import de `UserAvatar`
- Import de `UserProfileModal`
- Bloco do botão de tema (`{onToggleTheme ? (...) : null}`)
- `<button onClick={() => setProfileOpen(true)} className="fac-avatar-chip">` e seu conteúdo
- `<button onClick={() => setProfileOpen(true)} className="hidden sm:inline">` (nome do usuário)
- `<button onClick={handleLogout} ...>Sair</button>`
- `const [profileOpen, setProfileOpen] = useState(false)`
- `const handleLogout = async () => { ... }`
- `const userLabel = ...`
- `useEffect(() => { if (!user) { setMenuOpen(false); setProfileOpen(false); } }, [user])` — substituir por: `useEffect(() => { if (!user) setMenuOpen(false); }, [user])`
- `<UserProfileModal ... />` no final do JSX
- Imports não mais usados: `useRouter`, `api` (se logout foi removido)

**Manter:**
- `'use client'`
- Import de `Link` (Next.js)
- Import de `Search`
- Import de `AppNav`
- Import de `NotificationBell`
- Import de `useAuthStore`
- Import de `useUiStore`
- Logo "Facilita"
- Search bar (`fac-topbar-search`)
- `NotificationBell`
- Botão "Menu" mobile + dropdown do mobile nav
- `const [menuOpen, setMenuOpen] = useState(false)`

**Resultado final do lado direito da topbar:**
```tsx
<div className="fac-topbar-actions">
  <NotificationBell />
  <button
    type="button"
    onClick={() => setMenuOpen((prev) => !prev)}
    className="fac-button-secondary !h-9 !px-4 text-[11px] lg:!hidden"
    aria-expanded={menuOpen}
    aria-controls="app-mobile-nav"
  >
    Menu
  </button>
</div>
```

**Atualizar também a chamada de `AppHeader` em `app-shell.tsx`:** remover as props `theme` e `onToggleTheme`:
```tsx
<AppHeader />
```

### Checklist Etapa 4
- [x] `user-nav-menu.tsx` criado com trigger + popover completo
- [x] Popover fecha ao clicar fora (mousedown handler com cleanup)
- [x] Popover abre com animação `popIn` (usa tokens da Etapa 1)
- [x] "Editar Perfil" fecha popover e chama `onOpenProfile()`
- [x] "Tema" chama `toggleTheme` do `useUiStore` e mostra ícone correto
- [x] "Sair" faz POST `/auth/logout`, chama `clearAuth()`, redireciona para `/login`
- [x] `.fac-nav-footer` tem `display: flex` (verificar/adicionar em `globals.css`)
- [x] `AppNav` recebe e usa `onOpenProfile`
- [x] `app-shell.tsx` tem `profileOpen` state e renderiza `UserProfileModal`
- [x] Topbar simplificada: logo, search, NotificationBell, botão Menu mobile
- [x] Props `theme` e `onToggleTheme` removidas de `AppHeader` e da chamada em `app-shell`
- [x] Imports órfãos limpos de `app-header.tsx`
- [x] Desktop: perfil acessível pelo footer da sidebar
- [x] Mobile: perfil acessível pelo dropdown do hamburguer (AppNav renderiza UserNavMenu)
- [x] Logout funciona
- [x] Dark mode no popover funcional

---

## ETAPA 5 — Dashboard: Hierarquia Visual e Barras de Progresso

**Arquivo:** `src/app/(app)/dashboard/page.tsx`

### 5.1 — Substituir estados de loading/error

Localizar e substituir:
```tsx
// DE:
<div className="fac-panel px-6 py-10 text-center text-[14px] text-muted-foreground">Carregando dashboard...</div>
// PARA:
<div className="fac-loading-state">Carregando dashboard...</div>

// DE:
<div className="fac-panel border-red-400 bg-red-50 px-6 py-4 text-[14px] text-red-700">{error}</div>
// PARA:
<div className="fac-error-state">{error}</div>
```

### 5.2 — Adicionar animação de entrada

No container principal, linha ~174:
```tsx
// DE:
<div className="fac-page">
// PARA:
<div className="fac-page" style={{ animation: 'fadeUp var(--duration-slow) var(--ease-out) both' }}>
```

### 5.3 — Adicionar seção hero

Dentro do `<div className="fac-panel-body space-y-6">`, como **primeiro filho** (antes do grid de filtros na linha ~183):

```tsx
<div className="rounded-[14px] border border-primary/15 bg-primary/[0.06] px-6 py-5 dark:bg-primary/10">
  <p className="fac-kicker mb-1">Visão geral</p>
  <p className="font-display text-[38px] leading-none text-foreground">{stats.totalItems}</p>
  <p className="mt-1 text-[14px] text-muted-foreground">
    itens no portal — {periodLabel}
  </p>
</div>
```

### 5.4 — Substituir barras estáticas por barras proporcionais

**Card "Distribuição por tipo"** (linha ~275): substituir `<div className="mb-3 h-2 rounded-full bg-muted/80" />` por:
```tsx
<div className="mb-3 flex h-2 overflow-hidden rounded-full bg-muted/80">
  {stats.totalItems > 0 && (
    <>
      <div
        className="h-full bg-primary transition-all duration-500"
        style={{ width: `${(stats.links / stats.totalItems) * 100}%` }}
      />
      <div
        className="h-full bg-accent/70 transition-all duration-500"
        style={{ width: `${(stats.schedules / stats.totalItems) * 100}%` }}
      />
      <div
        className="h-full bg-muted-foreground/40 transition-all duration-500"
        style={{ width: `${(stats.notes / stats.totalItems) * 100}%` }}
      />
    </>
  )}
</div>
```

**Card "Visibilidade"** (linha ~295): substituir `<div className="mb-3 h-2 rounded-full bg-muted/80" />` por:
```tsx
{(() => {
  const totalPublic = stats.linkPublic + stats.schedulePublic + stats.notePublic;
  const totalPrivate = stats.linkPrivate + stats.schedulePrivate + stats.notePrivate;
  const total = totalPublic + totalPrivate;
  return (
    <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-muted/80">
      {total > 0 && (
        <>
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(totalPublic / total) * 100}%` }}
          />
          <div
            className="h-full bg-muted-foreground/40 transition-all duration-500"
            style={{ width: `${(totalPrivate / total) * 100}%` }}
          />
        </>
      )}
    </div>
  );
})()}
```

### Checklist Etapa 5
- [x] Loading state usa `fac-loading-state`
- [x] Error state usa `fac-error-state`
- [x] Animação `fadeUp` no container principal
- [x] Seção hero com `stats.totalItems` + `periodLabel` antes dos filtros
- [x] Barra proporcional em "Distribuição por tipo" (3 segmentos: links/docs/notas)
- [x] Barra proporcional em "Visibilidade" (2 segmentos: público/restrito)
- [x] Sem divisão por zero (`stats.totalItems > 0` e `total > 0`)
- [x] Dark mode no hero banner (`dark:bg-primary/10`)
- [x] Barras reagem aos filtros (os valores em `stats` já são derivados de `visibleByContent` via `useMemo`)

---

## ETAPA 6 — Auditoria Visual das Páginas Admin

**Arquivos:** `src/app/(app)/admin/backup/page.tsx`, `admin/images/page.tsx`, `admin/permissions/page.tsx`, `admin/reset/page.tsx`, `admin/restore/page.tsx`, `admin/settings/page.tsx`

**Escopo:** Corrigir inconsistências visuais **mantendo Tailwind inline** (sem migrar para `fac-*`). Ler cada arquivo antes de editar.

### 6.1 — Critérios de substituição de cores hardcoded

Substituir em cada página onde encontrar:

| De | Para |
|---|---|
| `text-red-700` | `text-destructive` |
| `bg-red-50` | `bg-destructive/5` |
| `border-red-400` | `border-destructive/40` |
| `text-gray-500` | `text-muted-foreground` |
| `border-gray-200` | `border-border` |
| `bg-gray-50` | `bg-card/70` |
| `bg-blue-500`, `bg-blue-600` | `bg-primary` |
| `text-white` (em botões azuis) | `text-primary-foreground` |

### 6.2 — Verificar títulos de página

Confirmar que cada página usa exatamente:
```tsx
<h1 className="fac-subtitle">Título da Página</h1>
```

Se usar `text-[24px]` inline no `h1`, substituir por `fac-subtitle`.

### 6.3 — Não alterar

- Botões que já usam `bg-primary`, `bg-destructive`, `text-foreground`, `text-muted-foreground`
- Lógica de negócio, estados, hooks
- Estrutura de layout e componentes
- Qualquer coisa que já usa variáveis do tema corretamente

### Checklist Etapa 6
- [x] `backup/page.tsx`: sem `red-*`/`gray-*` hardcoded, título usa `fac-subtitle`
- [x] `images/page.tsx`: idem
- [x] `permissions/page.tsx`: idem
- [x] `reset/page.tsx`: idem
- [x] `restore/page.tsx`: idem
- [x] `settings/page.tsx`: idem
- [x] Dark mode funcional em todas as páginas revisadas

---

## Arquivos Criados e Modificados (Resumo)

### Novos arquivos:
- `src/components/user-nav-menu.tsx`

### Arquivos modificados:
| Arquivo | O que muda |
|---|---|
| `src/app/globals.css` | tokens de animação, keyframes, classes utilitárias, transição grid |
| `src/stores/ui-store.ts` | adicionar theme, setTheme, toggleTheme |
| `src/components/app-nav.tsx` | head interno, labels de grupo, footer com UserNavMenu, prop onOpenProfile |
| `src/components/app-shell.tsx` | usar theme do store, gerenciar profileOpen, remover theme local, passar onOpenProfile, remover botão collapse do footer |
| `src/components/app-header.tsx` | remover avatar/nome/logout/theme, simplificar topbar |
| `src/app/(app)/dashboard/page.tsx` | hero, barras de progresso, classes utilitárias |
| `src/app/(app)/admin/backup/page.tsx` | correções visuais |
| `src/app/(app)/admin/images/page.tsx` | correções visuais |
| `src/app/(app)/admin/permissions/page.tsx` | correções visuais |
| `src/app/(app)/admin/reset/page.tsx` | correções visuais |
| `src/app/(app)/admin/restore/page.tsx` | correções visuais |
| `src/app/(app)/admin/settings/page.tsx` | correções visuais |

---

## Verificação Final (End-to-End)

Após todas as etapas, verificar:

1. **Desktop expandido:** sidebar com cabeçalho (brand "Facilita" + botão collapse), labels de grupo, footer com avatar+nome. Topbar sem avatar.
2. **Desktop colapsado:** sidebar mostra apenas ícones + avatar sozinho no footer. Brand name oculto. Labels ocultos.
3. **Transição de colapso:** sidebar anima suavemente ao colapsar/expandir (via `transition: grid-template-columns`).
4. **Popover de perfil:** abre acima do footer com animação `popIn`, mostra nome/role, botões funcionam, fecha ao clicar fora.
5. **Tema:** toggle via popover da sidebar funciona, persiste após reload (localStorage).
6. **Mobile:** hamburguer na topbar abre dropdown com nav completa incluindo footer de perfil.
7. **Dashboard:** hero com total de itens, barras proporcionais reativas aos filtros, animação `fadeUp` na entrada.
8. **Dark mode:** hero, popover, topbar simplificada funcionam em dark.
9. **Logout:** funciona via popover da sidebar (desktop e mobile).
10. **Editar perfil:** abre `UserProfileModal` via popover.
11. **SSR/hidratação:** sem erros de hidratação — toda inicialização de `localStorage` usa guard `typeof window !== 'undefined'`.
12. **TypeScript:** zero erros de tipo após as mudanças.
