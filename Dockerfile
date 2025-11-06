# Dockerfile đa mục tiêu (multi-stage build)

# ======================
# 1️⃣ Backend Stage
# ======================
FROM python:3.11-slim AS backend

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend /app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ======================
# 2️⃣ Frontend Stage
# ======================
FROM node:22-alpine AS frontend

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
RUN npm install lucide-react
COPY frontend /app
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "dev"]
