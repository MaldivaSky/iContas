# Backend Dockerfile - Flask + Gunicorn
FROM python:3.11-slim

WORKDIR /app

# Dependências do sistema
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copia requirements e instala
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia código
COPY . /app

# Exponha a porta que o app usa
EXPOSE 5000

# Comando padrão (usa gunicorn para produção)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
