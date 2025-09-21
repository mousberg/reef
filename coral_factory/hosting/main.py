from pathlib import Path
import subprocess


def deploy_workflow(query: str) -> None:
    root = Path(__file__).resolve().parent
    print(root)
    project_root = root.parent  # reef/coral_factory
    query = query.replace("'", "\\'").replace('"', '\\"').replace('\n', ' ')

    # Write server Dockerfile (builds coral-server jar and includes Python/uv for executable agents)
    dockerfile_server = """\
FROM gradle:8.14.2-jdk21 AS build
WORKDIR /home/gradle/src
COPY /hosting/shared/coral-server /home/gradle/src

# Build minimal JRE
RUN jlink \
    --verbose \
    --add-modules java.base,jdk.unsupported,java.desktop,java.instrument,java.logging,java.management,java.sql,java.xml,java.naming,jdk.crypto.ec \
    --compress 2 --strip-debug --no-header-files --no-man-pages \
    --output /opt/minimal-java

# Build server
RUN gradle build --no-daemon -x test

# Runtime stage with Python/uv for executing local agents
FROM python:3.13-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash curl ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python env and package management used by agents
RUN pip install --no-cache-dir uv

ENV JAVA_HOME=/opt/minimal-java
ENV PATH="$JAVA_HOME/bin:$PATH"
ENV CONFIG_PATH="/config"

RUN mkdir -p /app

# Copy minimal JRE and built jar
COPY --from=build "$JAVA_HOME" "$JAVA_HOME"
COPY --from=build /home/gradle/src/build/libs/ /app/

# Link stable jar name
RUN ln -s "$(ls -1 /app/coral-server-*.jar | grep -v '\-plain\.jar' | head -n 1)" /app/coral-server.jar

# Default to reading registry from /data/registry.toml which we will mount
ENV REGISTRY_FILE_PATH=/app/registry.toml

RUN pip install --no-cache-dir openai-agents[litellm] agents-arcade arcadepy python-dotenv PyYAML
RUN pip install --no-cache-dir langchain langchain-community langchain-experimental langchain-groq langchain-huggingface langchain-mcp-adapters langchain-openai
RUN pip install --no-cache-dir pymongo
COPY hosting/shared /app

EXPOSE 5555
ENTRYPOINT ["java", "-jar", "/app/coral-server.jar"]
"""
    (root / "Dockerfile.server").write_text(dockerfile_server)

    # Write research runner Dockerfile (runs research/multi_quick_start.py)
    dockerfile_runner = """\
FROM python:3.12-slim
WORKDIR /app
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir requests python-dotenv
COPY hosting/shared/research /app
CMD ["python3", "/app/multi_quick_start.py"]
"""
    (root / "Dockerfile.research").write_text(dockerfile_runner)

    # Write docker-compose for two services
    compose = f"""\
services:
  coral-server:
    build:
      context: {project_root}
      dockerfile: hosting/Dockerfile.server
    container_name: coral-server
    environment:
      - REGISTRY_FILE_PATH=/app/registry.toml
      # Uncomment to enable docker runtime for agents instead of executable
      # - DOCKER_SOCKET=/var/run/docker.sock
      - ARCADE_API_KEY=${{ARCADE_API_KEY:-}}
      - OPENAI_API_KEY=${{OPENAI_API_KEY:-}}
      - MONGO_URI=${{MONGO_URI:-}}
      - USER_ID=${{USER_ID:-}}
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS -o /dev/null http://0.0.0.0:5555/v1/docs || exit 1"]
      interval: 1s
      timeout: 1s
      retries: 100
      start_period: 1s

    networks:
      - coral-network

  research:
    build:
      context: {project_root}
      dockerfile: hosting/Dockerfile.research
    container_name: coral-research
    depends_on:
      coral-server:
        condition: service_healthy
    environment:
      - CORAL_API_BASE_URL=http://coral-server:5555
      - TOOL_SERVER_LISTEN_HOST=0.0.0.0
      - TOOL_SERVER_ADVERTISED_HOST=coral-research
      - TOOL_SERVER_PORT=38080
      - APPLICATION_ID=myApp
      - PRIVACY_KEY=privkey
      # Model config passed through to agents via options
      - MODEL_PROVIDER=${{MODEL_PROVIDER:-openai}}
      - MODEL_NAME=${{MODEL_NAME:-gpt-4.1-mini}}
      - MODEL_API_KEY=${{MODEL_API_KEY:-}}
      - MODEL_MAX_TOKENS=${{MODEL_MAX_TOKENS:-16000}}
      - MODEL_TEMPERATURE=${{MODEL_TEMPERATURE:-0.3}}
      - OPENAI_API_KEY=${{OPENAI_API_KEY:-}}
      - AGENTS_PATH=/app/agents/
      - AGENT_QUERY='{query}'
      - MONGO_URI=${{MONGO_URI:-}}
      - RESULTS_API_URL=${{RESULTS_API_URL:-http://host.docker.internal:8000/results}}
      - ARCADE_API_KEY=${{ARCADE_API_KEY:-}}
      - USER_ID=${{USER_ID:-}}
    # Tool server only needs to be reachable inside the network
    expose:
      - "38080"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - coral-network
 
networks:
  coral-network:
    name: coral-network
    driver: bridge
"""

    compose_path = root / "docker-compose.yml"
    compose_path.write_text(compose)

    # Build and start the stack
    subprocess.run(
        ["docker", "compose", "--env-file", ".env", "up", "--build"], #, "-d"],
        check=True,
        cwd=root,
    )


def kill_docker_containers():
    root = Path(__file__).resolve().parent

    subprocess.run(
        ["docker", "compose", "down"],
        check=True,
        cwd=root,
    )


if __name__ == "__main__":
    # deploy_workflow("List all the repos of https://github.com/Coral-Protocol, and mail me the list to florisfok5@gmail.com")

    deploy_workflow("List all the repos of https://github.com/Coral-Protocol, and mail me the list to florisfok5@gmail.com")

