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
rsync -avz /Users/floris.fok/Library/CloudStorage/OneDrive-Prosus-Naspers/Documents/agents/reef/coral_factory floris@204.12.168.160:/home/floris/reef


## BUILD AND RUN
""" requirements.txt
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pydantic python-dotenv pyyaml toml
python app.py
"""


