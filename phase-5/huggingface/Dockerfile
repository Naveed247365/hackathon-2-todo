# Hugging Face Space - Full Todo App (Backend + Frontend + MCP)
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl supervisor nginx && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend
COPY backend/ /app/backend/
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Copy MCP server
COPY mcp-server/ /app/mcp-server/
WORKDIR /app/mcp-server
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend and build
COPY frontend/ /app/frontend/
WORKDIR /app/frontend
RUN npm ci && npm run build

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose Hugging Face default port
EXPOSE 7860

WORKDIR /app

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
