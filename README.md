# FACILITA CHVC

Projeto monorepo contendo o frontend em React e o backend em Flask descritos em `Resumo Estratégico do Projeto FACILITA CHVC.md`.

## Requisitos

- Node.js 18+
- Python 3.10+

## Instalação

### Backend

```bash
copy .env.example .env  # gere o arquivo de configuracao na raiz do projeto
cd backend
python -m venv venv
source venv/bin/activate ou venv\Scripts\activate
pip install -r requirements.txt
# Edite ../.env e defina SECRET_KEY para producao se necessario
# O usuário administrador padrão será criado automaticamente
# exponha o servidor para a rede com FLASK_HOST=0.0.0.0
FLASK_DEBUG=0 FLASK_HOST=0.0.0.0 python wsgi.py
```

Se novos modelos forem adicionados ao backend, basta reiniciar o servidor. O `create_app()` garante que tabelas ausentes sejam criadas automaticamente e que o usuário administrador exista.

### Frontend

```bash
cd frontend
npm install
npm run dev         # roda em http://localhost:5173

# para producao, gere os arquivos em `frontend/dist`
npm run build
```

Para compilar o frontend em produção é necessário ter o Node.js instalado e a
CLI do Vite disponível (`npm install -g vite`).

Quando existir a pasta `frontend/dist`, o servidor Flask irá servir esses
arquivos automaticamente. Com o backend iniciado usando `FLASK_HOST=0.0.0.0`,
basta acessar `http://<IP_DA_MAQUINA>:5000` a partir de qualquer dispositivo da
mesma rede para utilizar o sistema em produção.


Após realizar login em `/admin/login`, utilize o menu de administração para
criar cores, categorias e links. A sessão é mantida automaticamente pelo
navegador.
Credenciais padrão do administrador: **admin/admin123**
Se as credenciais não funcionarem (por exemplo após reutilizar volumes de uma
instalação anterior), execute `python backend/setup_db.py` para recriar o
usuário administrador ou remova os volumes com `docker compose down -v`.

Agora é possível registrar novos usuários acessando `/register`. Cada usuário tem seus próprios links privados. O administrador visualiza todos os links e o nome de quem os criou. Usuários autenticados podem alterar sua senha em `/change-password`. Somente o administrador pode criar categorias, cores e gerenciar usuários.

Usuários comuns são direcionados para `/user/links` após o login. Nesta tela são listados os links gerais em modo somente leitura e, separadamente, os links do próprio usuário com opções de adicionar, editar ou excluir.

Cada usuario pode tambem personalizar suas proprias cores (tema). Essas preferencias ficam salvas no servidor, sem interferir nos demais. O tema definido pelo administrador serve como padrao para visitantes nao autenticados.

## Usando Docker

É possível executar todo o projeto utilizando contêineres. O arquivo
`docker-compose.yml` monta quatro serviços: `db` (PostgreSQL), `backend`,
`frontend` e `nginx`. Copie `\.env.example` para `\.env` e ajuste as variáveis se
necessário. Defina também `VITE_API_URL` para `/api` (ou para a URL
publicamente acessível do backend), garantindo que o frontend se comunique
corretamente com a API durante a construção da imagem Docker mesmo quando
o sistema for acessado por outros computadores.

Para iniciar basta ter o Docker instalado e executar:

```bash
docker compose up --build
```

Com o Nginx mapeando apenas a porta 80, o sistema fica disponível em
`http://localhost` (ou no IP da máquina que executa o Docker, por exemplo
`http://10.17.201.75`). O Nginx encaminha as rotas `/api` para o backend e o
restante para o frontend, que continua escutando internamente na porta 5173
sem expor essa porta para o host. Os dados do banco e os uploads são
armazenados em volumes nomeados para persistirem entre execuções.

Se o sistema for acessado somente por HTTP (sem HTTPS), mantenha
`FLASK_DEBUG=1` para que o cookie de sessão seja enviado corretamente.

Se o frontend estiver rodando em um endereço diferente do backend, o Flask agora
permite cookies em requisições entre origens (CORS com `supports_credentials`).
A sessão utiliza `SESSION_COOKIE_SAMESITE=None` e define automaticamente
`SESSION_COOKIE_SECURE` conforme o modo de depuração, garantindo que o login
funcione mesmo quando frontend e backend usam hosts distintos.
