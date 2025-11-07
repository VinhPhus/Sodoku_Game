# ======================
# 1️⃣ Backend stage
# ======================
FROM python:3.11-slim AS backend

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend /app
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ======================
# 2️⃣ Frontend stage
# ======================
FROM node:22-alpine AS frontend

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
RUN npm install socket.io-client lucide-react
COPY frontend /app
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
#-===
