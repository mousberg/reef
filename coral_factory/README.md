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

## BUILD AND RUN
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


