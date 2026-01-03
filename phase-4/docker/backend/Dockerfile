# Multi-stage Dockerfile for FastAPI Backend
# Stage 1: Builder - Install dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Copy requirements file
COPY phase-2/backend/requirements.txt .

# Install dependencies to user site-packages
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime - Minimal production image
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Copy installed packages from builder to appuser's home
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# Copy application code from phase-2/backend
COPY --chown=appuser:appuser phase-2/backend/ .

# Add local bin to PATH
ENV PATH=/home/appuser/.local/bin:$PATH

# Expose backend port
EXPOSE 8000

# Switch to non-root user
USER appuser

# Run uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
