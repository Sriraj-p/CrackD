FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY backend/ ./backend/
COPY rag_docs/ ./rag_docs/
COPY server.py .

# Copy pre-built frontend
COPY frontend/dist/ ./frontend/dist/

ENV PORT=8080

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
