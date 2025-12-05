# FREE & Open-Source Tools Catalog

## Purpose
Battle-tested, production-ready tools with ZERO recurring costs. Every tool listed here is either completely free or has a generous free tier sufficient for MVP and early growth stages.

**Budget Mantra**: "Don't pay until you're making money."

---

## Category 1: LLM Inference (FREE)

### Tier A: Best for Production

| Tool | Free Tier | Context | Speed | Best For |
|------|-----------|---------|-------|----------|
| **Groq** | Limited free | 128K | Fastest | Production speed |
| **Gemini API** | 1000 req/day | 32K-1M | Fast | Development |
| **Hugging Face** | Limited free | Varies | Medium | Model variety |

### Tier B: Self-Hosted (Forever Free)

| Tool | License | Models | Requirements |
|------|---------|--------|--------------|
| **Ollama** | MIT | LLaMA, Mistral, Gemma | 8GB+ RAM |
| **vLLM** | Apache 2.0 | Any HF model | GPU recommended |
| **llama.cpp** | MIT | GGUF models | CPU-friendly |
| **text-generation-webui** | AGPL | Any | GPU recommended |

### Recommended Setup
```bash
# Development (daily use)
# Use Gemini CLI - 1000 free requests/day
npm install -g @google/generative-ai
gemini "Your prompt"

# Local testing (unlimited)
# Use Ollama
brew install ollama  # or curl equivalent
ollama pull llama3.2:3b  # Small, fast
ollama pull llama3.2:7b  # Better quality
```

---

## Category 2: Agent Frameworks (All FREE)

### LangChain Ecosystem (MIT License)

| Package | Purpose | Install |
|---------|---------|---------|
| **langchain** | Core framework | `pip install langchain` |
| **langchain-core** | Minimal core | `pip install langchain-core` |
| **langgraph** | State machines | `pip install langgraph` |
| **langserve** | API deployment | `pip install langserve` |
| **langsmith** | Tracing (free tier) | Free tier available |

```python
# Minimal LangGraph setup
from langgraph.graph import StateGraph
from langgraph.checkpoint.memory import MemorySaver

graph = StateGraph(YourState)
# Add nodes and edges
app = graph.compile(checkpointer=MemorySaver())
```

### Google ADK (Apache 2.0)

| Component | Purpose | Maturity |
|-----------|---------|----------|
| **Python ADK** | Agent development | v1.19 (Stable) |
| **JavaScript ADK** | Web agents | v0.1 (Alpha) |
| **Evaluation Suite** | Testing | Production-ready |

```bash
pip install google-adk
```

### Other Frameworks (All Open Source)

| Framework | License | Best For |
|-----------|---------|----------|
| **CrewAI** | MIT | Multi-agent teams |
| **AutoGen** | MIT | Conversational agents |
| **Semantic Kernel** | MIT | .NET/Python |
| **Haystack** | Apache 2.0 | Search/RAG |

---

## Category 3: Vector Databases (FREE Options)

### Self-Hosted (Forever Free)

| Database | License | Best For | Install |
|----------|---------|----------|---------|
| **ChromaDB** | Apache 2.0 | Local dev | `pip install chromadb` |
| **Qdrant** | Apache 2.0 | Production | Docker available |
| **Weaviate** | BSD-3 | GraphQL fans | Docker available |
| **Milvus** | Apache 2.0 | Large scale | Complex setup |

### Managed (Free Tiers)

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **Pinecone** | 1 index, 100K vectors | Getting started |
| **Supabase pgvector** | 500MB | Postgres users |

### Recommended: ChromaDB
```python
import chromadb

# Persistent storage (free, local)
client = chromadb.PersistentClient(path="./chroma_db")

# Create collection
collection = client.create_collection(
    name="student_memories",
    metadata={"hnsw:space": "cosine"}
)

# Add documents
collection.add(
    documents=["Student struggled with DFA minimization"],
    metadatas=[{"student_id": "123", "topic": "dfa"}],
    ids=["mem_001"]
)

# Query
results = collection.query(
    query_texts=["DFA problems"],
    n_results=5
)
```

---

## Category 4: Embeddings (FREE)

### Local (No API Costs)

| Model | Size | Quality | Install |
|-------|------|---------|---------|
| **all-MiniLM-L6-v2** | 80MB | Good | sentence-transformers |
| **nomic-embed-text** | 274MB | Better | Ollama |
| **mxbai-embed-large** | 670MB | Best | Ollama |

```python
# Using sentence-transformers (free, local)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(["Your text here"])

# Using Ollama (free, local)
# ollama pull nomic-embed-text
import ollama
ollama.embeddings(model='nomic-embed-text', prompt='Your text')
```

### API (Free Tiers)

| Provider | Free Tier | Dimensions |
|----------|-----------|------------|
| **Voyage AI** | 50M tokens/month | 1024 |
| **Cohere** | 100 req/min | 1024 |
| **OpenAI** | Pay per use ($) | 1536 |

---

## Category 5: UI Frameworks (All FREE)

### Quick Prototyping

| Tool | Best For | Install |
|------|----------|---------|
| **Gradio** | ML demos | `pip install gradio` |
| **Streamlit** | Data apps | `pip install streamlit` |
| **Chainlit** | Chat apps | `pip install chainlit` |

```python
# Gradio (5 lines to chat UI)
import gradio as gr
def chat(message, history):
    return "AI response here"
gr.ChatInterface(chat).launch()

# Streamlit (simple chat)
import streamlit as st
st.chat_input("Say something")
```

### Production Web

| Framework | License | Best For |
|-----------|---------|----------|
| **Next.js** | MIT | Full-stack React |
| **Remix** | MIT | Full-stack React |
| **SvelteKit** | MIT | Lightweight |
| **Astro** | MIT | Content sites |

### Chat UIs

| Tool | License | Features |
|------|---------|----------|
| **Open WebUI** | MIT | ChatGPT clone |
| **LibreChat** | MIT | Multi-model |
| **Anything LLM** | MIT | Local + cloud |

---

## Category 6: Fine-Tuning (FREE)

### InstructLab (Red Hat, Apache 2.0)

**What**: Fine-tune LLMs on your data without expensive GPUs

```bash
# Install
pip install instructlab

# Initialize
ilab config init

# Add your knowledge
# Create taxonomy files with TOC concepts

# Generate synthetic data
ilab data generate

# Train (can run on CPU, slow but free)
ilab model train

# Serve your custom model
ilab model serve
```

### Other Free Options

| Tool | License | Hardware |
|------|---------|----------|
| **Axolotl** | Apache 2.0 | GPU needed |
| **LLaMA-Factory** | Apache 2.0 | GPU needed |
| **Unsloth** | Apache 2.0 | 2x faster |

---

## Category 7: Deployment (FREE Tiers)

### Hosting

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Vercel** | Generous | Next.js |
| **Netlify** | Generous | Static + Functions |
| **Railway** | $5 credit | Full-stack |
| **Render** | Free web service | Docker |
| **Fly.io** | 3 VMs free | Global edge |
| **Cloudflare Pages** | Unlimited | Static + Workers |

### Containers

| Platform | Free Tier |
|----------|-----------|
| **Hugging Face Spaces** | Free CPU, limited GPU |
| **Google Cloud Run** | 2M requests/month |
| **AWS Lambda** | 1M requests/month |

### Databases

| Service | Free Tier |
|---------|-----------|
| **Supabase** | 500MB Postgres |
| **PlanetScale** | 5GB MySQL |
| **MongoDB Atlas** | 512MB |
| **Turso** | 9GB SQLite |
| **Neon** | 512MB Postgres |

---

## Category 8: Monitoring & Observability (FREE)

### LLM Tracing

| Tool | Free Tier | Features |
|------|-----------|----------|
| **LangSmith** | 5K traces/month | LangChain native |
| **Langfuse** | Self-host free | Open source |
| **Phoenix** | Self-host free | Arize's OSS |

### General Monitoring

| Tool | License | Features |
|------|---------|----------|
| **Grafana** | AGPL | Dashboards |
| **Prometheus** | Apache 2.0 | Metrics |
| **Jaeger** | Apache 2.0 | Tracing |

---

## Category 9: Testing & Evaluation (FREE)

### Agent Testing

| Tool | License | Best For |
|------|---------|----------|
| **Google ADK Evaluator** | Apache 2.0 | Agent testing |
| **DeepEval** | Apache 2.0 | LLM evaluation |
| **Ragas** | Apache 2.0 | RAG evaluation |

```python
# DeepEval example
from deepeval import evaluate
from deepeval.metrics import AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

test_case = LLMTestCase(
    input="What is a DFA?",
    actual_output=model_response,
    expected_output="A DFA is..."
)
metric = AnswerRelevancyMetric()
evaluate([test_case], [metric])
```

---

## Category 10: Development Tools (FREE)

### Code Quality

| Tool | Purpose |
|------|---------|
| **Ruff** | Python linter (fast) |
| **Black** | Python formatter |
| **Prettier** | JS/TS formatter |
| **ESLint** | JS/TS linter |

### Documentation

| Tool | Purpose |
|------|---------|
| **MkDocs** | Python docs |
| **Docusaurus** | React docs |
| **Mintlify** | Modern docs (free tier) |

### API Development

| Tool | Purpose |
|------|---------|
| **FastAPI** | Python API |
| **Hono** | Edge-first JS |
| **tRPC** | Type-safe APIs |

---

## Recommended Stack: Zero-Cost MVP

### The Stack

```
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│  Next.js on Vercel (FREE)               │
│  or Gradio on HF Spaces (FREE)          │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│            AGENT LAYER                  │
│  LangGraph (MIT, FREE)                  │
│  Google ADK Evaluation (Apache, FREE)   │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│          INFERENCE LAYER                │
│  Dev: Gemini CLI (1000 req/day FREE)    │
│  Test: Ollama local (UNLIMITED FREE)    │
│  Prod: Groq pay-per-use (when needed)   │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│           MEMORY LAYER                  │
│  ChromaDB local (Apache, FREE)          │
│  SQLite for metadata (FREE)             │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│          EMBEDDING LAYER                │
│  sentence-transformers (FREE)           │
│  or Ollama nomic-embed (FREE)           │
└─────────────────────────────────────────┘
```

### Monthly Cost: $0

| Component | Cost |
|-----------|------|
| Vercel Hobby | $0 |
| Gemini API | $0 (1000/day) |
| Ollama | $0 (local) |
| ChromaDB | $0 (local) |
| LangGraph | $0 (open source) |
| **TOTAL** | **$0** |

---

## Migration Path: When You Have Revenue

### Stage 1: $0/month (MVP)
- Local everything
- Gemini free tier
- ChromaDB local

### Stage 2: $20-50/month (Growing)
- Groq for production speed
- Pinecone starter for reliability
- Vercel Pro for team features

### Stage 3: $100-500/month (Scaling)
- Dedicated inference (Replicate/Modal)
- Managed vector DB (Pinecone/Qdrant Cloud)
- Full observability (LangSmith Pro)

---

## Quick Start Commands

```bash
# 1. Install core tools
pip install langchain langgraph chromadb sentence-transformers

# 2. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b

# 3. Install Gemini CLI
npm install -g @google/generative-ai

# 4. Clone your project
git clone [your-repo]
cd ai-tutor-mvp

# 5. Set up local memory
mkdir -p data/chroma_db
mkdir -p data/memory_bank

# 6. Start building! (zero cost)
```

---

## Tool Selection Decision Tree

```
Need LLM inference?
├─ Free tier OK? → Gemini API (1000/day)
├─ Unlimited needed? → Ollama (local)
└─ Maximum speed? → Groq (pay-per-use)

Need vector storage?
├─ Development? → ChromaDB (local)
├─ Small scale? → Pinecone free tier
└─ Production? → Qdrant (self-host)

Need agent framework?
├─ Simple chains? → LangChain
├─ Complex state? → LangGraph
├─ Multi-agent? → CrewAI
└─ Evaluation? → Google ADK

Need UI quickly?
├─ Demo only? → Gradio
├─ Data app? → Streamlit
├─ Chat focus? → Chainlit
└─ Production? → Next.js
```

---

*Last updated: December 2024*
*Philosophy: Free until profitable, then pay for scale*
