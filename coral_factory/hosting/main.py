from pathlib import Path
import subprocess


def main() -> None:
    root = Path(__file__).resolve().parent
    # Ensure shared folder exists for volume mount
    (root / "shared").mkdir(parents=True, exist_ok=True)

    # Minimal Dockerfile
    dockerfile = """\
FROM python:3.12-slim
WORKDIR /app
CMD ["python", "-c", "print('Hello, World')"]
"""
    (root / "Dockerfile").write_text(dockerfile)

    # Minimal docker-compose with a volume mount
    compose = """\
services:
  hello:
    build: .
    volumes:
      - ./shared:/app/shared
    command: python -c "print('Hello, World')"
"""
    # Compose v2 prefers compose.yaml; docker compose reads docker-compose.yml too.
    (root / "docker-compose.yml").write_text(compose)

    # Run docker compose
    subprocess.run(
        ["docker", "compose", "up", "--build", "--abort-on-container-exit"],
        check=True,
        cwd=root,
    )


if __name__ == "__main__":
    main()

