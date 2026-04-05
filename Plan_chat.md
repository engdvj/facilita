# Plano: Chat em Tempo Real (DM + Grupos)

## Context
Adicionar um sistema de chat em tempo real ao portal Facilita v2. O backend já tem `socket.io`, `@nestjs/websockets` e `@nestjs/platform-socket.io` instalados, e existe um `NotificationsGateway` funcional com autenticação JWT — o chat reutiliza esse padrão inteiramente. O acesso será por ícone na "bolinha" (user-nav-menu) com badge de não lidos, abrindo um drawer lateral sem sair da página. Suporte a DM (1:1) e grupos.

---

## Arquitetura Geral

```
User A digita → socket.emit('chat:send', { roomId, content })
  → ChatGateway recebe → valida auth → salva no Prisma
  → server.to('chat:{roomId}').emit('chat:message', msg)
  → User B recebe instantaneamente (mesmo fechado → badge atualiza)
```

Socket: mesmo namespace do NotificationsGateway (sem namespace separado).
Histórico: REST endpoint paginado por cursor.
Redis: não necessário na fase 1 (instância única).

---

## BACKEND

### 1. Prisma Schema
**Arquivo:** `v2/backend/prisma/schema.prisma`

Adicionar ao final do schema:

```prisma
enum ChatRoomType {
  DIRECT
  GROUP
}

model ChatRoom {
  id        String       @id @default(uuid()) @db.Uuid
  type      ChatRoomType
  name      String?                         // Só para GROUP
  createdBy String?      @db.Uuid
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  creator  User?        @relation("ChatRoomsCreated", fields: [createdBy], references: [id])
  members  ChatMember[]
  messages ChatMessage[]

  @@index([type])
  @@index([createdBy])
}

model ChatMember {
  id         String    @id @default(uuid()) @db.Uuid
  roomId     String    @db.Uuid
  userId     String    @db.Uuid
  joinedAt   DateTime  @default(now())
  lastReadAt DateTime?

  room ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user User     @relation(fields: [userId], references: [id])

  @@unique([roomId, userId])
  @@index([userId])
}

model ChatMessage {
  id        String    @id @default(uuid()) @db.Uuid
  roomId    String    @db.Uuid
  senderId  String    @db.Uuid
  content   String
  editedAt  DateTime?
  deletedAt DateTime?
  createdAt DateTime  @default(now())

  room   ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  sender User     @relation("SentChatMessages", fields: [senderId], references: [id])

  @@index([roomId, createdAt])
  @@index([senderId])
}
```

Adicionar ao model `User` (junto com as outras relações):
```prisma
chatRoomsCreated ChatRoom[]    @relation("ChatRoomsCreated")
chatMembers      ChatMember[]
sentMessages     ChatMessage[] @relation("SentChatMessages")
```

Migration:
```bash
cd v2/backend && npx prisma migrate dev --name add_chat
```

---

### 2. Módulo de Chat
**Novo diretório:** `v2/backend/src/chat/`

#### `chat.module.ts`
```typescript
@Module({
  imports: [PrismaModule, JwtModule, UsersModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
```
Registrar em `v2/backend/src/app.module.ts`.

---

#### `chat.gateway.ts`
Reusa exatamente o padrão de `notifications.gateway.ts` (auth JWT no handshake).

**handleConnection:** igual ao NotificationsGateway — extrai token, verifica JWT, valida user, armazena `client.data.userId`. Além disso, faz `client.join()` em todos os rooms do usuário (busca via ChatService).

**Eventos client → server (`@SubscribeMessage`):**

| Evento | Payload | Ação |
|---|---|---|
| `chat:join` | `{ roomId }` | Valida membro → `client.join('chat:{roomId}')` |
| `chat:send` | `{ roomId, content }` | Salva no DB → emit `chat:message` para a room |
| `chat:typing` | `{ roomId, isTyping }` | Emit `chat:typing` para room (sem DB) |
| `chat:read` | `{ roomId }` | Atualiza `lastReadAt` no ChatMember |
| `chat:edit` | `{ messageId, content }` | Atualiza content + editedAt → emit `chat:message-edited` |
| `chat:delete` | `{ messageId }` | Soft delete → emit `chat:message-deleted` |

**Eventos server → client (emitidos via `server.to('chat:{roomId}')`):**

| Evento | Payload |
|---|---|
| `chat:message` | `{ message completo com sender }` |
| `chat:typing` | `{ userId, name, roomId, isTyping }` |
| `chat:message-edited` | `{ messageId, content, editedAt, roomId }` |
| `chat:message-deleted` | `{ messageId, roomId }` |
| `chat:read-update` | `{ roomId, userId, lastReadAt }` |

---

#### `chat.service.ts`
Métodos principais:

- `getOrCreateDM(userId1, userId2)` → busca ChatRoom DIRECT com esses 2 membros; cria se não existe
- `createGroup(creatorId, name, memberIds)` → cria ChatRoom GROUP + ChatMembers
- `getRoomsForUser(userId)` → rooms com lastMessage + unreadCount (calculado via lastReadAt vs última mensagem)
- `getMessages(roomId, userId, cursor?, limit=50)` → valida que userId é membro → retorna mensagens paginadas (cursor = createdAt da última mensagem carregada)
- `sendMessage(roomId, senderId, content)` → cria ChatMessage, valida membro
- `markAsRead(roomId, userId)` → atualiza `lastReadAt = now()` no ChatMember
- `editMessage(messageId, userId, content)` → valida sender → atualiza
- `deleteMessage(messageId, userId)` → valida sender → soft delete (`deletedAt = now()`)
- `addMember(roomId, actorId, userId)` → só para GROUP, valida que actor é membro
- `getUserRooms(userId)` → lista roomIds do usuário (usado no handleConnection para join automático)

---

#### `chat.controller.ts`
Protegido por `JwtAuthGuard` (mesmo padrão dos outros controllers).

```
GET    /api/chat/rooms                  → getRoomsForUser
POST   /api/chat/rooms/direct           → { recipientId } → getOrCreateDM
POST   /api/chat/rooms/group            → { name, memberIds[] } → createGroup
POST   /api/chat/rooms/:id/members      → { userId } → addMember (GROUP only)
DELETE /api/chat/rooms/:id/members/:uid → removeMember (GROUP only)
GET    /api/chat/rooms/:id/messages     → ?cursor=&limit=50 → getMessages
PATCH  /api/chat/messages/:id           → { content } → editMessage
DELETE /api/chat/messages/:id           → deleteMessage
```

---

#### DTOs (`chat/dto/`)
- `create-dm.dto.ts` → `recipientId: string (IsUUID)`
- `create-group.dto.ts` → `name: string (MinLength 1), memberIds: string[] (ArrayNotEmpty, IsUUID each)`
- `send-message.dto.ts` → `roomId: string (IsUUID), content: string (MinLength 1, MaxLength 2000)`
- `edit-message.dto.ts` → `content: string (MinLength 1, MaxLength 2000)`
- `get-messages.dto.ts` → `cursor?: string, limit?: number (default 50, max 100)`

---

## FRONTEND

### 3. Instalar socket.io-client
```bash
cd v2/frontend && npm install socket.io-client
```

---

### 4. Types
**Arquivo:** `v2/frontend/src/types/index.ts` — adicionar:

```typescript
export type ChatRoomType = 'DIRECT' | 'GROUP';

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  members: ChatMember[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ChatMember {
  id: string;
  roomId: string;
  userId: string;
  joinedAt: string;
  lastReadAt?: string;
  user: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'role'>;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
  sender: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}
```

---

### 5. Chat Store
**Novo arquivo:** `v2/frontend/src/stores/chat-store.ts`

Estado Zustand:
```typescript
{
  rooms: ChatRoom[]
  activeRoomId: string | null
  messages: Record<string, ChatMessage[]>        // roomId → messages
  typingUsers: Record<string, {userId, name}[]>  // roomId → quem está digitando
  isOpen: boolean                                // drawer aberto/fechado
  // computed:
  totalUnread: number                            // soma de unreadCount de todas as rooms
}
```

Ações: `setRooms`, `addRoom`, `setActiveRoom`, `addMessage`, `updateMessage`, `prependMessages` (scroll para cima), `updateLastRead`, `setTyping`, `toggleOpen`, `setOpen`.

---

### 6. Chat Hook (Socket)
**Novo arquivo:** `v2/frontend/src/hooks/useChat.ts`

- Cria/gerencia conexão `socket.io-client` (singleton) usando o JWT do `auth-store`
- `useEffect` com cleanup no desmount
- Ao conectar: fetch `GET /api/chat/rooms` → popula store → emit `chat:join` para cada room
- Listeners de eventos do servidor → atualizam chat-store
- Funções expostas: `sendMessage(roomId, content)`, `startTyping(roomId)`, `stopTyping(roomId)`, `markRead(roomId)`, `loadMoreMessages(roomId, cursor)`, `createDM(recipientId)`, `createGroup(name, memberIds)`
- Typing debounce: 300ms para `startTyping`, auto `stopTyping` após 2s sem digitar

---

### 7. Componentes
**Novo diretório:** `v2/frontend/src/components/chat/`

| Arquivo | Responsabilidade |
|---|---|
| `chat-drawer.tsx` | Container principal — slide-over da direita. Divide em lista (esquerda) + mensagens (direita). Em mobile: mostra um por vez |
| `chat-room-list.tsx` | Lista de rooms (DMs e grupos). Avatar, nome, última msg, badge de não lidos, timestamp. Botões "Novo DM" e "Novo Grupo" |
| `chat-room-view.tsx` | Lista de mensagens com scroll. Carrega mais ao scrollar para cima (cursor pagination). Indica typing |
| `chat-message-bubble.tsx` | Bolha: própria (direita) vs recebida (esquerda). Menu de contexto: editar/apagar (só nas próprias). Mostra "(editado)" e "Mensagem apagada" |
| `chat-input.tsx` | Textarea auto-resize. Enter envia, Shift+Enter nova linha. Emite typing events |
| `chat-typing-indicator.tsx` | "João está digitando..." com animação de pontos |
| `chat-new-dm-modal.tsx` | Lista usuários do sistema (GET /api/users), busca por nome, clica para iniciar DM |
| `chat-new-group-modal.tsx` | Input de nome do grupo + multi-select de usuários |

---

### 8. Integração: user-nav-menu.tsx
**Arquivo:** `v2/frontend/src/components/user-nav-menu.tsx`

Adicionar botão de chat ao lado do sino de notificações:
- Ícone: `MessageSquare` (Lucide)
- Badge: `chatStore.totalUnread` (quando > 0)
- `onClick`: `chatStore.toggleOpen()`
- Mesma classe/estilo do botão de notificações

---

### 9. Integração: app-shell.tsx
**Arquivo:** `v2/frontend/src/components/app-shell.tsx`

- Montar `<ChatDrawer />` no root (fora do `<main>`) quando usuário autenticado
- Montar `useChat()` hook aqui (ou dentro do ChatDrawer) — garante que mensagens chegam mesmo com drawer fechado → badge atualiza

---

### 10. Integração: permissions.ts (sidebar)
**Arquivo:** `v2/frontend/src/lib/permissions.ts`

Adicionar rota `/chat` no grupo `'Navegacao'`:
```typescript
{
  href: '/chat',
  label: 'Chat',
  icon: MessageSquareIcon,
  navGroup: 'Navegacao',
  subtitle: 'Mensagens em tempo real',
  description: 'Converse com outros usuários',
  keywords: ['chat', 'mensagem', 'conversa', 'dm', 'grupo'],
  requiredPermissions: [],
}
```

---

### 11. Página /chat (full-screen)
**Novo arquivo:** `v2/frontend/src/app/(app)/chat/page.tsx`

Renderiza o `<ChatDrawer>` em modo embutido (sem overlay, ocupando toda a área de conteúdo). Útil para uso prolongado.

---

## Ordem de Implementação

```
1.  Prisma: adicionar modelos + migrate
2.  chat.service.ts (lógica pura, testável)
3.  chat.gateway.ts (WebSocket)
4.  chat.controller.ts + DTOs
5.  Registrar ChatModule no app.module.ts
6.  npm install socket.io-client (frontend)
7.  types/index.ts (novos tipos)
8.  chat-store.ts
9.  useChat.ts (hook de socket)
10. Componentes: chat-drawer → chat-room-list → chat-room-view → chat-message-bubble → chat-input → modais
11. Integrar em user-nav-menu.tsx (badge + toggle)
12. Integrar em app-shell.tsx (montar drawer + hook)
13. permissions.ts (adicionar /chat ao nav)
14. app/(app)/chat/page.tsx
```

---

## Verificação (Testes Manuais)

1. Logar com 2 usuários em abas diferentes
2. Usuário A inicia DM com Usuário B (modal de novo DM)
3. Usuário A envia mensagem → deve aparecer instantaneamente na aba de B (badge atualiza)
4. Usuário B abre drawer → lê mensagem → badge some
5. Usuário B digita → A vê "B está digitando..."
6. Recarregar página → mensagens persistem (histórico via REST)
7. Scroll para cima na conversa → carrega mensagens mais antigas
8. Criar grupo com 3 usuários → mensagem aparece para todos os 3
9. Editar/apagar mensagem → reflete para todos na room
