# Coral Factory - AI Agent Workflow Creation and Deployment System

Coral Factory is a comprehensive system for creating, configuring, and deploying AI agent workflows. It provides a FastAPI-based server with authentication, dynamic workflow generation, and containerized deployment capabilities.

## 📁 System Architecture

### Core Components

#### `app.py` - Main FastAPI Server
- **Authentication**: Bearer token authentication (configurable via `CORAL_FACTORY_BEARER_TOKEN`)
- **API Endpoints**:
  - `POST /create/workflow` - Create workflow configurations from JSON
  - `POST /deploy/workflow` - Deploy workflows with specified settings
  - `POST /results` - Receive workflow execution results
  - `GET /health` - Health check endpoint
  - `GET /auth/status` - Authentication status check

#### `factory/` - Workflow Creation Engine
- **`from_json.py`**: Core workflow creation logic
  - Converts `WorkflowConfig` objects into agent configurations
  - Generates YAML files for OpenAI Agents SDK integration
  - Creates TOML metadata files for coral-server
  - Template-based agent generation and deployment
- **`create_workflow.py`**: Helper utilities for workflow configuration
- **`name_less/`**: Template directory containing base agent files:
  - `main.py` - OpenAI Agents SDK integration with Firebase tracing
  - `coral-agent.toml` - Agent metadata and configuration
  - `requirements.txt` - Python dependencies
  - `run_agent.sh` - Execution script

#### `hosting/` - Deployment Infrastructure
- **`main.py`**: Dynamic Docker deployment system
  - Generates Dockerfile.server (Kotlin coral-server + Python runtime)
  - Generates Dockerfile.research (Python research runner)
  - Creates docker-compose.yml with networking and health checks
  - Manages container lifecycle and environment configuration
- **`shared/`**: Shared resources and coral-server components
  - **`coral-server/`**: Kotlin-based agent orchestration server
  - **`research/`**: Agent implementations and multi-agent coordination
  - **`registry.toml`**: Agent registry configuration

## 🚀 Quick Start

### Prerequisites
```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Python and pip
sudo apt install -y python3 python3-pip

# Add user to docker group (optional, requires logout/login)
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### Setup and Installation
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic python-dotenv pyyaml toml

# Set authentication token (optional)
export CORAL_FACTORY_BEARER_TOKEN="your-secure-token"

# Run the server
uvicorn app:app --host 0.0.0.0 --port 8001
```

## 🔧 Configuration

### Environment Variables
- `CORAL_FACTORY_BEARER_TOKEN` - API authentication token (default: "coral-bearer-token-2024")
- `ARCADE_API_KEY` - Arcade API key for tool access
- `OPENAI_API_KEY` - OpenAI API key for LLM integration
- `FIREBASE_PROJECT_ID` - Firebase project for tracing (default: reefs-c1adb)
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON
- `MODEL_PROVIDER` - Model provider (default: openai)
- `MODEL_NAME` - Model name (default: gpt-4.1-mini)
- `RESULTS_API_URL` - URL for sending workflow results

### Workflow Configuration Schema
```json
{
  "main_task": "Primary objective description",
  "relations": "Description of agent interactions and relationships",
  "agents": [
    {
      "name": "agent_name",
      "description": "Agent description",
      "task": "Specific task for this agent",
      "expected_input": "Input format description",
      "expected_output": "Output format description",
      "tools": ["tool1", "tool2"]
    }
  ]
}
```

## 🚀 API Usage

### Create Workflow
```bash
curl -X POST http://localhost:8001/create/workflow \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "main_task": "Process customer inquiries",
    "relations": "Email agent reads emails, analysis agent processes content",
    "agents": [
      {
        "name": "email_processor",
        "description": "Email processing agent",
        "task": "Read and categorize emails",
        "expected_input": "Email messages",
        "expected_output": "Categorized email data",
        "tools": ["email.read", "text.analyze"]
      }
    ]
  }'
```

### Deploy Workflow
```bash
curl -X POST http://localhost:8001/deploy/workflow \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_name": "customer_support",
    "deploy_type": "local",
    "user_id": "user@example.com",
    "query": "Process incoming support tickets"
  }'
```

## 🏗️ Architecture Details

### Agent Generation Process
1. **Configuration Parsing**: JSON workflow config parsed into `WorkflowConfig` objects
2. **Template Application**: Base agent template (`name_less/`) copied for each agent
3. **File Generation**:
   - `final.yaml` - OpenAI Agents SDK configuration with model settings
   - `coral-agent.toml` - Coral server metadata and runtime configuration
4. **Registry Update**: `registry.toml` updated with new agent paths
5. **Deployment**: Docker containers built and orchestrated via docker-compose

### Multi-Agent Coordination
- **Coral Server**: Kotlin-based orchestration server managing agent communication
- **Thread Management**: Agents communicate through managed threads with mentions
- **Tool Integration**: Arcade toolkit integration for external API access
- **Tracing**: Firebase-based execution tracing and monitoring

### Docker Architecture
- **coral-server**: Gradle-built Kotlin server with JRE optimization and Python runtime
- **research**: Python environment for running multi-agent workflows
- **Networking**: Bridge network with health checks and inter-service communication
- **Volume Mounting**: Shared configuration and agent code via bind mounts

## 🔍 Monitoring and Debugging

### Health Checks
- Server health: `GET /health`
- Authentication status: `GET /auth/status`
- Docker health checks with configurable intervals

### Tracing Integration
- Firebase Firestore for trace and span storage
- OpenAI Agents SDK tracing processor
- User-scoped trace organization
- Real-time execution monitoring

## 🚢 Deployment Options

### Local Development
```bash
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### Production Deployment
```bash
# Using the deployment system
rsync -avz /path/to/coral_factory user@server:/home/user/coral_factory
# Configure environment variables and run via systemd or supervisor
```

## 📝 Development Notes

- **Agent Templates**: Modify `factory/name_less/` to customize base agent behavior
- **Tool Integration**: Extend agent tools through Arcade toolkit configuration
- **Authentication**: Customize bearer token validation in `app.py`
- **Deployment**: Modify `hosting/main.py` for different deployment targets
- **Monitoring**: Extend Firebase tracing for custom metrics and alerts
