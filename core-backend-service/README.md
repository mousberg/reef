# Core Backend Service

A FastAPI-based backend service for the Reef application.

## Features

- FastAPI web framework
- Health check endpoint
- Designed for uvicorn deployment

## Getting Started

### Prerequisites

- Python 3.8+
- uv (for dependency management)

### Installation

```bash
cd core-backend-service
uv install
```

### Running the Service

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

The service will be available at [http://localhost:8000](http://localhost:8000).

## API Endpoints

- `GET /health` - Health check endpoint that returns service status

## Development

The service uses FastAPI with uvicorn as the ASGI server. Add new endpoints by creating route handlers in `main.py`.

## License

This project is licensed under the MIT License.