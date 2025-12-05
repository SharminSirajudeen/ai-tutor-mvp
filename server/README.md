# AI Tutor Backend

FastAPI backend server powering the Socratic AI Tutor MVP. Uses LangGraph for agent orchestration and Groq LLaMA 3.3 70B for inference.

## Features

- **Socratic Teaching Method**: Guides students through guided questioning
- **Visual Canvas Integration**: Generates automata diagrams (DFA, NFA, PDA)
- **Streaming Responses**: Real-time SSE streaming for ChatGPT-like experience
- **Conversation Memory**: Persistent state across sessions
- **Zero Cost MVP**: Uses free tiers (Groq + in-memory storage)

## Architecture

```
server/
├── main.py                 # FastAPI app with endpoints
├── streaming.py            # SSE streaming utilities
├── lib/
│   ├── graphs/
│   │   └── socratic_graph.py   # Main LangGraph workflow
│   ├── chains/
│   │   └── socratic_chain.py   # Socratic prompting chain
│   ├── tools/
│   │   └── automata_builder.py # Canvas drawing tools
│   └── memory/
│       ├── student_state.py    # State definition
│       └── checkpointer.py     # Persistence abstraction
└── requirements.txt        # Python dependencies
```

## Quick Start

### 1. Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 2. Get Groq API Key

1. Go to https://console.groq.com/keys
2. Create a free account
3. Generate an API key
4. Add to `.env`: `GROQ_API_KEY=your_key_here`

### 3. Run Server

**Option A: Using startup script (recommended)**
```bash
./start.sh
```

**Option B: Manual**
```bash
source venv/bin/activate
python main.py
```

Server will start on http://0.0.0.0:8000

## API Endpoints

### Health Check
```bash
GET /
```

Response:
```json
{
  "status": "ok",
  "message": "AI Tutor Backend is running",
  "version": "0.1.0",
  "groq_configured": true,
  "endpoints": {
    "chat": "/api/v1/chat",
    "stream": "/api/v1/chat/stream"
  }
}
```

### Standard Chat
```bash
POST /api/v1/chat
Content-Type: application/json

{
  "message": "What is a DFA?",
  "session_id": "student_123",
  "problem_context": "Learning about automata",
  "topic": "DFA"
}
```

Response:
```json
{
  "response": "Great question! Instead of telling you, let me help you discover it. What do you think the 'D' in DFA might stand for?",
  "draw_commands": [],
  "understanding_level": "confused",
  "session_id": "student_123"
}
```

### Streaming Chat (SSE)
```bash
POST /api/v1/chat/stream
Content-Type: application/json

{
  "message": "Draw a DFA that accepts strings ending in 'ab'",
  "session_id": "student_123",
  "topic": "DFA"
}
```

Response (Server-Sent Events):
```
data: {"type": "message", "content": "Let's build this together..."}

data: {"type": "draw_commands", "commands": [{"type": "addState", "label": "q0", ...}]}

data: {"type": "done"}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | - | Groq API key for LLM inference |
| `CHECKPOINTER_TYPE` | No | `memory` | Persistence type: `memory`, `sqlite`, `postgres` |
| `SQLITE_PATH` | No | `./data/tutor.db` | SQLite database path (if using sqlite) |
| `DATABASE_URL` | No | - | PostgreSQL connection string (if using postgres) |

## Development

### Project Structure

- **main.py**: FastAPI application with endpoints
- **streaming.py**: SSE streaming utilities for real-time responses
- **lib/graphs/socratic_graph.py**: LangGraph workflow implementing Socratic method
- **lib/chains/socratic_chain.py**: Prompting chain with teaching strategies
- **lib/tools/automata_builder.py**: Tools for generating canvas draw commands
- **lib/memory/**: State management and checkpointing

### Adding New Features

**Add a new tool:**
1. Define tool in `lib/tools/`
2. Add to `AUTOMATA_TOOLS` list
3. Tool will be automatically available to the LLM

**Add a new teaching strategy:**
1. Create prompt template in `lib/chains/socratic_chain.py`
2. Use in graph nodes as needed

**Change LLM model:**
Edit `lib/graphs/socratic_graph.py`:
```python
llm = ChatGroq(
    model="llama-3.3-70b-versatile",  # Change this
    temperature=0.7,
    api_key=GROQ_API_KEY,
)
```

### Testing

```bash
# Test imports
python -c "from lib.graphs.socratic_graph import socratic_tutor; print('OK')"

# Test server startup
python main.py

# Test API (in another terminal)
curl http://localhost:8000/

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a DFA?", "session_id": "test"}'
```

## Deployment

### Option 1: Railway.app (Free Tier)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 2: Render.com (Free Tier)
1. Connect GitHub repo
2. Set environment variable: `GROQ_API_KEY`
3. Build command: `pip install -r requirements.txt`
4. Start command: `python main.py`

### Option 3: Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
```

## Scaling & Upgrades

### When to Upgrade Storage

**Free (Current)**: Memory-only
- ✅ Perfect for MVP
- ❌ Loses data on restart

**Cheap ($0/month)**: SQLite
```bash
# In .env
CHECKPOINTER_TYPE=sqlite
SQLITE_PATH=./data/tutor.db
```

**Production ($20+/month)**: PostgreSQL
```bash
# In .env
CHECKPOINTER_TYPE=postgres
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### When to Add More Models

Add to `lib/graphs/socratic_graph.py`:
```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# Use different models for different tasks
fast_llm = ChatGroq(model="llama-3.3-70b-versatile")  # Quick responses
smart_llm = ChatOpenAI(model="gpt-4")  # Complex reasoning
```

## Troubleshooting

### Import Error: "cannot import name 'ToolNode'"
This is expected with older LangGraph versions. We handle tool execution manually.

### "GROQ_API_KEY not configured"
1. Check `.env` file exists
2. Verify `GROQ_API_KEY=...` is set (not placeholder)
3. Restart server after changing `.env`

### "urllib3 NotOpenSSLWarning"
This is a warning, not an error. Safe to ignore for MVP. To fix:
```bash
pip install --upgrade urllib3 'urllib3<2'
```

### Server won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000

# Use different port
python main.py --port 8001
```

## Contributing

1. Follow existing code structure
2. Add docstrings to all functions
3. Keep budget consciousness in mind (prefer free solutions)
4. Test with `python -c "import module"` before committing

## License

MIT

## Support

- Issues: GitHub Issues
- Documentation: `/docs` endpoint when server is running
- API Reference: http://localhost:8000/docs (Swagger UI)

---

**Budget**: $0/month (Groq free tier + in-memory storage)
**Built with**: FastAPI, LangGraph, LangChain, Groq
**Deployment**: Railway, Render, or any Python host
