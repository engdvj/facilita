# FACILITA CHVC

Projeto monorepo contendo o frontend em React e o backend em Flask descritos em `Resumo Estratégico do Projeto FACILITA CHVC.md`.

## Requisitos

- Node.js 18+
- Python 3.10+

## Instalação

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate ou venv\Scripts\activate
pip install -r requirements.txt
python setup_db.py  # cria o banco e o usuário admin
python wsgi.py      # inicia o servidor em http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev         # roda em http://localhost:5173
```

Credenciais padrão do administrador: **admin/admin123**

