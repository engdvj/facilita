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
python setup_db.py  # cria o banco e o usuário admin
# exponha o servidor para a rede com FLASK_HOST=0.0.0.0
FLASK_DEBUG=0 FLASK_HOST=0.0.0.0 python wsgi.py
```

Se novos modelos forem adicionados ao backend, execute novamente `python setup_db.py` ou simplesmente reinicie o servidor. O `create_app()` agora garante que tabelas ausentes sejam criadas automaticamente.

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

