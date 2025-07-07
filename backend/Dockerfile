FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code
COPY backend /app/backend
COPY uploads /app/uploads
COPY .env.example /app/.env

WORKDIR /app/backend

EXPOSE 5000

CMD ["python", "wsgi.py"]
