# 🚀 Guia de Teste - FACILITA V2.0

## 📋 Checklist Pré-Teste

- [ ] Docker e Docker Compose instalados
- [ ] Portas 80, 3000, 3001, 5432, 6379 disponíveis
- [ ] Arquivo `.env` criado e configurado

## 🔧 Configuração Inicial

### 1. Preparar Ambiente

\`\`\`bash
# Entre no diretório v2
cd v2

# Copie o arquivo de ambiente
cp .env.example .env

# IMPORTANTE: Edite o .env e altere as senhas!
# Use um editor de texto de sua preferência
\`\`\`

**Variáveis importantes no .env:**
- `JWT_ACCESS_SECRET`: Chave secreta para tokens (mude isso!)
- `JWT_REFRESH_SECRET`: Chave secreta para refresh tokens (mude isso!)
- `SUPERADMIN_EMAIL`: Email do superadmin (padrão: superadmin@facilita.local)
- `SUPERADMIN_PASSWORD`: Senha do superadmin (padrão: ChangeMe123!)

### 2. Iniciar Aplicação

\`\`\`bash
# Construa e inicie todos os serviços
docker-compose up -d --build

# Acompanhe os logs para ver se tudo iniciou
docker-compose logs -f
\`\`\`

**Aguarde até ver:**
- ✅ PostgreSQL: "database system is ready to accept connections"
- ✅ Backend: "🚀 Application is running on: http://localhost:3001"
- ✅ Frontend: "Ready"
- ✅ Nginx: "start worker processes"

### 3. Verificar Serviços

\`\`\`bash
# Verifique se todos estão rodando
docker-compose ps

# Teste os endpoints
curl http://localhost:3001/api/health  # Backend
curl http://localhost:3000              # Frontend
curl http://localhost/health            # Nginx
\`\`\`

## 🧪 Roteiro de Testes

### Teste 1: Autenticação

#### 1.1 Primeiro Acesso
1. Abra http://localhost no navegador
2. Você será redirecionado para o login
3. Use as credenciais do .env (padrão):
   - Email: `superadmin@facilita.local`
   - Senha: `ChangeMe123!`
4. ✅ Deve fazer login e ir para o dashboard

#### 1.2 Persistência de Sessão
1. Recarregue a página (F5)
2. ✅ Deve manter você logado
3. Abra uma nova aba: http://localhost
4. ✅ Deve continuar logado

#### 1.3 Logout e Re-login
1. Clique em "LOGOUT" no header
2. ✅ Deve ser deslogado e redirecionado para login
3. Faça login novamente
4. ✅ Deve funcionar normalmente

---

### Teste 2: Empresas (Companies)

#### 2.1 Criar Primeira Empresa
1. No menu lateral, clique em "Empresas"
2. Clique em "Nova Empresa"
3. Preencha:
   - Nome: `Empresa Teste`
   - CNPJ: `12.345.678/0001-90` (opcional)
4. Clique em "Criar"
5. ✅ Empresa deve aparecer na lista

#### 2.2 Editar Empresa
1. Clique em "Editar" na empresa criada
2. Altere o nome para `Empresa Teste Editada`
3. Clique em "Salvar"
4. ✅ Nome deve ser atualizado na lista

---

### Teste 3: Unidades (Units)

#### 3.1 Criar Unidade
1. No menu lateral, clique em "Unidades"
2. Clique em "Nova Unidade"
3. Preencha:
   - Empresa: Selecione "Empresa Teste Editada"
   - Nome: `Unidade Matriz`
   - CNPJ: `12.345.678/0002-71` (opcional)
4. Clique em "Criar"
5. ✅ Unidade deve aparecer na lista

---

### Teste 4: Setores (Sectors)

#### 4.1 Criar Setor
1. No menu lateral, clique em "Setores"
2. Clique em "Novo Setor"
3. Preencha:
   - Empresa: Selecione "Empresa Teste Editada"
   - Unidade: Selecione "Unidade Matriz"
   - Nome: `TI - Tecnologia`
   - Descrição: `Setor de Tecnologia da Informação`
4. Clique em "Criar"
5. ✅ Setor deve aparecer na lista

---

### Teste 5: Usuários (Users)

#### 5.1 Criar Usuário Admin
1. No menu lateral, clique em "Usuarios"
2. Clique em "Novo Usuario"
3. Preencha:
   - Nome: `João Admin`
   - Email: `joao@empresa.com`
   - Senha: `Admin123!`
   - Role: `ADMIN`
   - Empresa: Selecione "Empresa Teste Editada"
   - Unidade: Selecione "Unidade Matriz"
   - Setor: Selecione "TI - Tecnologia"
4. Clique em "Criar"
5. ✅ Usuário deve aparecer na lista

---

### Teste 6: Categorias (Categories)

#### 6.1 Criar Categorias
1. No menu lateral (seção "Portal"), clique em "Categorias"
2. Crie as seguintes categorias:

**Categoria 1:**
- Nome: `Ferramentas`
- Cor: Azul (#3b82f6)
- Ícone: 🛠️
- Admin Only: Não

**Categoria 2:**
- Nome: `Documentação`
- Cor: Verde (#22c55e)
- Ícone: 📚
- Admin Only: Não

**Categoria 3:**
- Nome: `Interno`
- Cor: Vermelho (#ef4444)
- Ícone: 🔒
- Admin Only: Sim

3. ✅ Todas devem aparecer na lista

---

### Teste 7: Links

#### 7.1 Criar Link Simples
1. No menu lateral (seção "Portal"), clique em "Links"
2. Clique em "Novo Link"
3. Preencha:
   - Título: `Google`
   - URL: `https://www.google.com`
   - Descrição: `Mecanismo de busca`
   - Categoria: Selecione "Ferramentas"
   - Setor: Selecione "TI - Tecnologia"
   - Público: ✅ (marcado)
4. Clique em "Criar"
5. ✅ Link deve aparecer como card

#### 7.2 Criar Link com Imagem
1. Clique em "Novo Link"
2. Preencha:
   - Título: `GitHub`
   - URL: `https://github.com`
   - Descrição: `Plataforma de desenvolvimento`
   - Categoria: Selecione "Ferramentas"
3. Faça upload de uma imagem:
   - Clique em "Escolher arquivo"
   - Selecione uma imagem (PNG, JPG, até 5MB)
   - Aguarde o upload concluir
4. ✅ Preview da imagem deve aparecer
5. Clique em "Criar"
6. ✅ Link deve aparecer com a imagem

#### 7.3 Editar Link
1. Clique em "Editar" em um dos links
2. Altere o título
3. Clique em "Salvar"
4. ✅ Link deve ser atualizado

#### 7.4 Excluir Link
1. Clique em "Excluir" em um link
2. Confirme a exclusão
3. ✅ Link deve sumir da lista (soft delete)

---

### Teste 8: Agendas/Documentos (Schedules)

#### 8.1 Upload de PDF
1. No menu lateral (seção "Portal"), clique em "Agendas/Documentos"
2. Clique em "Novo Documento"
3. Preencha:
   - Título: `Manual do Sistema`
   - Arquivo: Faça upload de um arquivo PDF
   - Categoria: Selecione "Documentação"
   - Setor: Selecione "TI - Tecnologia"
   - Público: ✅ (marcado)
4. ✅ Nome do arquivo e tamanho devem aparecer
5. Clique em "Criar"
6. ✅ Documento deve aparecer na tabela

#### 8.2 Upload de Excel
1. Clique em "Novo Documento"
2. Preencha:
   - Título: `Planilha de Dados`
   - Arquivo: Faça upload de um arquivo Excel (.xlsx)
   - Categoria: Selecione "Ferramentas"
3. Clique em "Criar"
4. ✅ Documento deve aparecer com extensão XLS

#### 8.3 Baixar Documento
1. Clique em "Baixar" em um documento
2. ✅ Arquivo deve ser baixado

---

### Teste 9: Navegação e UX

#### 9.1 Navegação Entre Páginas
1. Navegue por todas as páginas usando o menu lateral:
   - Dashboard
   - Categorias
   - Links
   - Agendas/Documentos
   - Empresas
   - Unidades
   - Setores
   - Usuários
2. ✅ Todas devem carregar sem erros

#### 9.2 Responsividade
1. Redimensione a janela do navegador
2. Teste em modo mobile (F12 → Device Toolbar)
3. ✅ Layout deve se adaptar

---

### Teste 10: Validações e Erros

#### 10.1 Validação de Formulários
1. Tente criar um link sem preencher o título
2. ✅ Deve mostrar erro de campo obrigatório
3. Tente criar um link com URL inválida (ex: "teste")
4. ✅ Deve mostrar erro de URL inválida

#### 10.2 Upload de Arquivo Inválido
1. Tente fazer upload de um arquivo muito grande (>20MB) em Agendas
2. ✅ Deve mostrar erro de tamanho
3. Tente fazer upload de um arquivo de tipo inválido em Imagens
4. ✅ Deve mostrar erro de tipo

---

## 📊 Verificação de Dados no Banco

\`\`\`bash
# Entre no container do Postgres
docker-compose exec postgres psql -U postgres -d facilita_v2

# Liste as empresas
SELECT id, name, status FROM "Company";

# Liste os links
SELECT id, title, url, "isPublic" FROM "Link";

# Liste os documentos
SELECT id, title, "fileName", "fileSize" FROM "UploadedSchedule";

# Saia do psql
\q
\`\`\`

---

## 🐛 Troubleshooting

### Problema: Não consigo fazer login

**Soluções:**
1. Verifique se o backend está rodando:
   \`\`\`bash
   curl http://localhost:3001/api/health
   \`\`\`

2. Verifique os logs do backend:
   \`\`\`bash
   docker-compose logs backend
   \`\`\`

3. Verifique se o seed foi executado:
   \`\`\`bash
   docker-compose exec backend npx prisma studio
   \`\`\`

### Problema: Upload de arquivos não funciona

**Soluções:**
1. Verifique se os diretórios existem:
   \`\`\`bash
   docker-compose exec backend ls -la uploads/
   \`\`\`

2. Verifique os logs:
   \`\`\`bash
   docker-compose logs backend | grep -i upload
   \`\`\`

### Problema: Erro 401 (Unauthorized)

**Soluções:**
1. Faça logout e login novamente
2. Limpe o localStorage do navegador:
   - F12 → Application → Local Storage → Clear
3. Recarregue a página

### Problema: Erro de CORS

**Solução:**
1. Verifique o .env do backend:
   \`\`\`
   CORS_ORIGIN=*
   \`\`\`

2. Reinicie o backend:
   \`\`\`bash
   docker-compose restart backend
   \`\`\`

---

## 🎯 Resultados Esperados

Após completar todos os testes, você deve ter:

- [x] 1 Empresa cadastrada
- [x] 1 Unidade cadastrada
- [x] 1 Setor cadastrado
- [x] 2 Usuários (superadmin + 1 admin)
- [x] 3 Categorias cadastradas
- [x] 2+ Links cadastrados (com e sem imagem)
- [x] 2+ Documentos cadastrados (PDF, Excel, etc)
- [x] Sistema funcionando completamente
- [x] Navegação fluida entre todas as páginas
- [x] Upload de arquivos funcionando

---

## 🧹 Limpar Dados de Teste

\`\`\`bash
# ATENÇÃO: Isso vai APAGAR TODOS OS DADOS!

# Pare os containers
docker-compose down

# Remova os volumes (apaga o banco de dados)
docker-compose down -v

# Inicie novamente do zero
docker-compose up -d --build
\`\`\`

---

## 📝 Relatório de Bugs

Se encontrar algum problema, anote:

1. **O que você fez?**
2. **O que esperava?**
3. **O que aconteceu?**
4. **Mensagem de erro (se houver)**
5. **Logs do console (F12 → Console)**

---

**Boa sorte nos testes! 🚀**
