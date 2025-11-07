# ======================
# 1️⃣ Backend stage
# ======================
FROM python:3.11-slim AS backend

WORKDIR /app

# Cài dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source backend
COPY backend /app

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]


# ======================
# 2️⃣ Frontend stage
# ======================
FROM node:22-alpine AS frontend

WORKDIR /app

# Copy package.json trước để cache npm install
COPY frontend/package*.json ./

# Cài đầy đủ dependencies
RUN npm install
RUN npm install axios socket.io-client lucide-react

# Copy code frontend sau khi cài xong
COPY frontend ./

# Build production
#RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]