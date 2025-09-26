FROM python:3.12-slim

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

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]


