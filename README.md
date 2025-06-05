# FACILITA CHVC

Projeto monorepo contendo o frontend em React e o backend em Flask descritos em `Resumo Estratégico do Projeto FACILITA CHVC.md`.

## Requisitos

- Node.js 18+
- Python 3.10+

## Instalação

### Backend

```bash
cp .env.example .env  # gere o arquivo de configuracao na raiz do projeto
cd backend
python -m venv venv
source venv/bin/activate ou venv\Scripts\activate
pip install -r requirements.txt
# Edite ../.env e defina JWT_SECRET_KEY para producao se necessario
python setup_db.py  # cria o banco e o usuário admin
FLASK_DEBUG=0 python wsgi.py      # inicia em producao
```

Se novos modelos forem adicionados ao backend, execute novamente `python setup_db.py` ou simplesmente reinicie o servidor. O `create_app()` agora garante que tabelas ausentes sejam criadas automaticamente.

### Frontend

```bash
cd frontend
npm install
npm run dev         # roda em http://localhost:5173
```

Para compilar o frontend em produção é necessário ter o Node.js instalado e a
CLI do Vite disponível (`npm install -g vite`).

Credenciais padrão do administrador: **admin/admin123**

