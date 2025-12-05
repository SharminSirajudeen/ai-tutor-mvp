# AI Tutor Backend - Quick Start Guide

Get the backend running in 5 minutes.

## Prerequisites

- Python 3.9+ installed
- Terminal access
- Internet connection

## Step 1: Get Groq API Key (2 minutes)

1. Go to https://console.groq.com/keys
2. Sign up (free, no credit card required)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

## Step 2: Configure Environment (1 minute)

```bash
cd /Users/sharminsirajudeen/Projects/ai-tutor-mvp/server
cp .env.example .env
nano .env  # or use any text editor
```

Replace `your_groq_api_key_here` with your actual key:
```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

Save and exit.

## Step 3: Run Server (2 minutes)

```bash
./start.sh
```

The script will:
1. Create virtual environment (if needed)
2. Install dependencies (if needed)
3. Validate configuration
4. Start the server

You should see:
```
============================================================
Starting server on http://0.0.0.0:8000
API docs available at http://0.0.0.0:8000/docs
```

## Step 4: Test It Works

**Open another terminal and run:**

```bash
# Test health check
curl http://localhost:8000/

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is a DFA?",
    "session_id": "test_123"
  }'
```

You should get a Socratic response!

## Step 5: Explore API Docs

Open in browser: http://localhost:8000/docs

This gives you interactive API documentation where you can:
- See all endpoints
- Test requests directly
- View request/response schemas

## Common Issues

### "GROQ_API_KEY not configured"
- Check `.env` file exists
- Verify the key is not the placeholder
- Make sure there are no extra spaces

### "Port 8000 already in use"
```bash
# Find what's using the port
lsof -i :8000

# Kill it (if safe)
kill -9 <PID>

# Or use different port
python main.py --port 8001
```

### "Module not found"
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Next Steps

### 1. Run Tests
```bash
python test_backend.py
```

### 2. Try Streaming Endpoint
```bash
curl -N -X POST http://localhost:8000/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Draw a DFA", "session_id": "test"}'
```

### 3. Connect Frontend
Update frontend API URL to point to `http://localhost:8000`

### 4. Deploy to Production
See `DEPLOYMENT.md` for Railway/Render deployment steps

## Useful Commands

```bash
# Stop server
Ctrl + C

# Restart server
./start.sh

# View logs (if running in background)
tail -f server.log

# Run tests
python test_backend.py

# Check what's running
ps aux | grep python
```

## Development Workflow

```bash
# Morning: Start server
./start.sh

# Make code changes...
# Server auto-reloads (uvicorn --reload)

# Test changes
curl -X POST http://localhost:8000/api/v1/chat ...

# Evening: Commit changes
git add .
git commit -m "Add feature X"
git push
```

## Help

- **API Issues:** Check http://localhost:8000/docs
- **Groq Issues:** https://status.groq.com
- **Code Issues:** See README.md
- **Deployment:** See DEPLOYMENT.md

---

**You're ready!** The backend is running and waiting for frontend requests.

**API Base URL:** http://localhost:8000
**Docs:** http://localhost:8000/docs
**Health:** http://localhost:8000/
