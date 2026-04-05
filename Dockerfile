FROM node:20-slim AS frontend
WORKDIR /app/frontend

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_CRACKD_API_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_CRACKD_API_URL=$NEXT_PUBLIC_CRACKD_API_URL

COPY frontend/package*.json ./
RUN npm ci --platform=linux --arch=x64
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY rag_docs/ ./rag_docs/
COPY server.py .
COPY --from=frontend /app/frontend/dist ./frontend/dist
ENV PORT=8080
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
