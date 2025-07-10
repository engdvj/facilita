FROM python:3.10-slim

WORKDIR /app

# Instala as dependências
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copia o código da aplicação
COPY backend /app/backend
COPY uploads /app/uploads
COPY .env.example /app/.env

# Copia o script de espera para a raiz do container
COPY backend/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

WORKDIR /app/backend

EXPOSE 5000

# Altere o CMD para usar o wait-for-it.sh, apontando para o serviço 'db' na porta 5432
CMD ["/wait-for-it.sh", "db:5432", "--", "python", "wsgi.py"]
