# AI Tutor Backend - Deployment Guide

Complete guide for deploying the AI Tutor backend to production.

## Pre-Deployment Checklist

- [ ] GROQ_API_KEY configured
- [ ] All tests passing (`python test_backend.py`)
- [ ] Requirements.txt up to date
- [ ] .env.example updated with new variables
- [ ] README.md reflects current features

## Local Development

### First Time Setup

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add GROQ_API_KEY
./start.sh
```

### Daily Development

```bash
cd server
./start.sh  # Handles activation and validation
```

### Testing

```bash
# Run test suite
python test_backend.py

# Test specific endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a DFA?", "session_id": "test_123"}'
```

## Production Deployment

### Option 1: Railway.app (Recommended for MVP)

**Why Railway:**
- Free tier: 500 hours/month, 512MB RAM
- GitHub integration (auto-deploy on push)
- Environment variable management
- Free PostgreSQL database (if needed later)

**Steps:**

1. Install Railway CLI
```bash
npm install -g @railway/cli
```

2. Login and initialize
```bash
railway login
cd server
railway init
```

3. Add environment variables
```bash
railway variables set GROQ_API_KEY=your_key_here
```

4. Deploy
```bash
railway up
```

5. Get URL
```bash
railway domain
```

**Cost:** $0/month (within free tier limits)

### Option 2: Render.com

**Why Render:**
- Free tier: 750 hours/month
- Auto-deploy from GitHub
- Free PostgreSQL database
- Custom domains on free tier

**Steps:**

1. Push code to GitHub
2. Go to https://render.com/
3. Create new "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python main.py`
   - **Environment Variables:** Add `GROQ_API_KEY`
6. Deploy

**Cost:** $0/month (free tier)

### Option 3: Fly.io

**Why Fly.io:**
- Free tier: 3 shared VMs
- Global edge deployment
- Better performance than Railway/Render
- PostgreSQL included

**Steps:**

1. Install flyctl
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login
```bash
flyctl auth login
```

3. Create fly.toml
```toml
app = "ai-tutor-backend"

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/python"]

[[services]]
  internal_port = 8000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[env]
  PORT = "8000"
```

4. Deploy
```bash
flyctl launch
flyctl secrets set GROQ_API_KEY=your_key_here
flyctl deploy
```

**Cost:** $0/month (free tier)

### Option 4: Self-Hosted (VPS)

**For:** DigitalOcean, Linode, AWS EC2, etc.

**Steps:**

1. SSH into server
```bash
ssh user@your-server.com
```

2. Install dependencies
```bash
sudo apt update
sudo apt install python3.9 python3-pip python3-venv nginx
```

3. Clone repository
```bash
git clone https://github.com/your-repo/ai-tutor-mvp.git
cd ai-tutor-mvp/server
```

4. Setup application
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

5. Create systemd service
```bash
sudo nano /etc/systemd/system/ai-tutor.service
```

```ini
[Unit]
Description=AI Tutor Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ai-tutor-mvp/server
Environment="PATH=/home/ubuntu/ai-tutor-mvp/server/venv/bin"
ExecStart=/home/ubuntu/ai-tutor-mvp/server/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

6. Start service
```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-tutor
sudo systemctl start ai-tutor
```

7. Configure nginx
```bash
sudo nano /etc/nginx/sites-available/ai-tutor
```

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. Enable and test
```bash
sudo ln -s /etc/nginx/sites-available/ai-tutor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Cost:** $5-10/month (basic VPS)

## Environment Variables (Production)

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key | `gsk_...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `CHECKPOINTER_TYPE` | Storage backend | `memory` |
| `DATABASE_URL` | PostgreSQL URL | - |
| `PORT` | Server port | `8000` |
| `HOST` | Bind address | `0.0.0.0` |
| `ENV` | Environment | `production` |

## Scaling Considerations

### Phase 1: MVP (Current)
- **Users:** 1-100
- **Storage:** Memory (MemorySaver)
- **Cost:** $0/month
- **Hosting:** Railway/Render free tier

### Phase 2: Early Growth
- **Users:** 100-1,000
- **Storage:** SQLite (persistent)
- **Cost:** $0-5/month
- **Hosting:** Railway Starter or Render

Add to .env:
```bash
CHECKPOINTER_TYPE=sqlite
SQLITE_PATH=/data/tutor.db
```

### Phase 3: Scale
- **Users:** 1,000-10,000
- **Storage:** PostgreSQL
- **Cost:** $20-50/month
- **Hosting:** Railway Pro or Render

Add to .env:
```bash
CHECKPOINTER_TYPE=postgres
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Phase 4: Production
- **Users:** 10,000+
- **Storage:** PostgreSQL with replicas
- **Cost:** $100+/month
- **Hosting:** AWS/GCP with auto-scaling

## Monitoring & Observability

### Basic (Free)

Add to requirements.txt:
```
prometheus-client==0.20.0
```

Add to main.py:
```python
from prometheus_client import Counter, Histogram, generate_latest

request_count = Counter('requests_total', 'Total requests')
request_duration = Histogram('request_duration_seconds', 'Request duration')

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Advanced (Paid)

**Sentry (Error Tracking)**
```bash
pip install sentry-sdk[fastapi]
```

```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

**Cost:** Free tier (5k errors/month), then $26/month

## Security Checklist

- [ ] Environment variables never committed to git
- [ ] CORS restricted to frontend domain
- [ ] Rate limiting enabled (use slowapi)
- [ ] API key rotation process documented
- [ ] HTTPS enabled (automatic on Railway/Render/Fly)
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

## Rollback Plan

### Railway/Render/Fly
```bash
# Railway
railway rollback

# Render
# Use dashboard to redeploy previous version

# Fly.io
flyctl releases list
flyctl releases rollback <version>
```

### Self-Hosted
```bash
git log  # Find previous commit
git checkout <commit-hash>
sudo systemctl restart ai-tutor
```

## Performance Tuning

### 1. Enable Response Compression
```python
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### 2. Add Response Caching
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

@app.on_event("startup")
async def startup():
    FastAPICache.init(InMemoryBackend())
```

### 3. Connection Pooling (PostgreSQL)
```python
from sqlalchemy import create_engine
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0
)
```

## Troubleshooting

### Server won't start
```bash
# Check logs
railway logs  # Railway
render logs   # Render
flyctl logs   # Fly.io

# Check locally
./start.sh
```

### Out of memory
```bash
# Check usage
railway metrics  # Railway

# Solutions:
# 1. Upgrade to paid tier
# 2. Optimize conversation memory
# 3. Clear old sessions
```

### Slow responses
```bash
# Check Groq API status
curl https://status.groq.com

# Solutions:
# 1. Add response caching
# 2. Use streaming endpoint
# 3. Reduce token limits
```

## Cost Breakdown (Monthly)

### MVP (Current)
- Hosting: $0 (Railway/Render free tier)
- Groq API: $0 (free tier)
- Database: $0 (memory)
- **Total: $0/month**

### Growth (100-1k users)
- Hosting: $0-7 (Railway Starter)
- Groq API: $0-20 (usage-based)
- Database: $0 (SQLite)
- **Total: $0-27/month**

### Scale (1k-10k users)
- Hosting: $7-20 (Railway Pro)
- Groq API: $20-100 (usage-based)
- Database: $5-15 (PostgreSQL)
- **Total: $32-135/month**

## Support

- **Deployment Issues:** Check platform docs
- **API Issues:** Check Groq status page
- **Code Issues:** GitHub Issues

---

**Remember:** Start with free tier, scale when revenue justifies cost.
