FROM python:3.12-slim

# Install build-essential for g++ and other build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install Python dependencies first (better layer caching)
COPY requirements.txt ./requirements.txt
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy the application source
COPY . .

EXPOSE 8001

# Default auth token can be overridden at runtime
ENV FACTORY_BEARER_TOKEN=bearer-token-2024

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]


