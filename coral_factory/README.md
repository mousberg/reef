# Building Coral Agents like it's easy


let's go


## Deploy on bare metal

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

# Verify installations
docker --version
docker-compose --version
python3 --version
pip3 --version

# Start Docker service (Linux)
sudo systemctl start docker
sudo systemctl enable docker
```

## SEND
rsync -avz local_path remote:remote_path

## RUN

### Local
```bash
# ENV
EXPORT FIREBASE_PROJECT_ID = ""
EXPORT FIREBASE_SERVICE_ACCOUNT_PATH = ""
EXPORT ARCADE_API_KEY= ""
EXPORT OPENAI_API_KEY= ""

# VENV
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# RUN
uvicorn app:app --host 0.0.0.0 --port 8001
```

### Docker
```bash
# Build image (from this directory)
docker build -t coral-factory:latest .

# Run container (basic)
docker run --rm \
  -p 8001:8001 \
  --name coral-factory \
  coral-factory:latest

# Run container with env vars and Firebase service account mounted
# Replace the example values and JSON path with your own
docker run --rm \
  -p 8001:8001 \
  --name coral-factory \
  -e FACTORY_BEARER_TOKEN="bearer-token" \
  -e ARCADE_API_KEY="your-arcade-api-key" \
  -e OPENAI_API_KEY="your-openai-api-key" \
  -e FIREBASE_PROJECT_ID="your-firebase-project-id" \
  -e FIREBASE_SERVICE_ACCOUNT_PATH="/secrets/firebase.json" \
  -v $(pwd)/path/to/firebase-service-account.json:/secrets/firebase.json:ro \
  coral-factory:latest

# Health check (no auth required)
curl http://localhost:8001/health
```


## TEST ENDPOINTS

```bash
curl -X GET "http://204.12.168.160:8001/auth/authorize/<user_id>/Slack" \
  -H "Authorization: Bearer <bearer-token>"

curl -X GET "http://localhost:8001/auth/tools" \
  -H "Authorization: Bearer <bearer-token>"

curl -X POST "http://localhost:8001/run/workflow/local" \
  -H "Authorization: Bearer <bearer-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_config": {
      "objective": "Do research and send the information to the user using Slack and Email.",
      "relations_type": "manager",
      "model_name": "gpt-4.1",
      "api_key": "OPENAI_API_KEY",
      "agents": [
        {
          "name": "Research agent",
          "mcp_servers": [
            {
              "name": "arxiv",
              "server_type": "HTTP",
              "params": {
                "url": "https://arxiv.org", 
                "timeout": 60
              }
            }
          ],
          "toolkits": [],
          "persona": "research scientist",
          "output": "A detailed, referenced research summary.",
          "guidelines": "Be thorough and cite sources. Summarise the paper in a few sentences. Write the text for an engineering audience."
        },
        {
          "name": "Slack agent",
          "mcp_servers": [],
          "toolkits": ["slack"],
          "persona": "expert slack user",
          "output": "Well-documented, working code.",
          "guidelines": "Write clean, efficient, slack messages. Use the slack formatting to make the message look nice."
        },
        {
          "name": "Email agent",
          "mcp_servers": [],
          "toolkits": ["gmail"],
          "persona": "Has access to gmail and can send emails",
          "output": "Clear, insightful emails.",
          "guidelines": "Use the gmail tools to send emails. End the email with a signature: sent from the Reef Factory."
        }
      ]
    },
    "user_id": "user_id",
    "user_task": "Which Slack channels are there and mail me the list to mail"
  }'


curl -X GET "http://localhost:8001/workflow/status/<trace_id>" \
  -H "Authorization: Bearer <bearer-token>"

curl -X GET "http://localhost:8001/workflow/result/<trace_id>" \
  -H "Authorization: Bearer <bearer-token>"

```