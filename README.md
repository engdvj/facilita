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
# A aplicacao usa por padrao a chave 'facilita-dev-secret' quando executada em
# modo de desenvolvimento. Para producao, defina sua propria:
# export JWT_SECRET_KEY=uma-chave-secreta
# ou deixe sem definir e ela usara a padrao acima
python setup_db.py  # cria o banco e o usuário admin
python wsgi.py      # inicia o servidor em http://localhost:5000
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

