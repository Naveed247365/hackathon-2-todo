# Hugging Face Space - Full Todo App (Backend + Frontend + MCP + Event-Driven Architecture)
FROM python:3.11-slim

# Install system dependencies including Node.js 20
RUN apt-get update && apt-get install -y \
    curl \
    supervisor \
    nginx \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend
COPY backend/ /app/backend/
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Copy MCP server
COPY mcp-server/ /app/mcp-server/
WORKDIR /app/mcp-server
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend
COPY frontend/ /app/frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 7860

WORKDIR /app

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]