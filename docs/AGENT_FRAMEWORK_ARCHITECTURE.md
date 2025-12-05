# AI Tutor MVP: Agent Framework Architecture

## Mission: Democratize MIT/Harvard-Level Education

This document outlines the comprehensive strategy for enhancing the AI Tutor MVP using open-source agent development frameworks. The goal is to create a world-class Socratic tutor for Theory of Computation that is both **intelligent** and **reliable**.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Framework Analysis](#framework-analysis)
   - [Google ADK](#google-adk-agent-development-kit)
   - [LangChain/LangGraph](#langchainlanggraph)
4. [The Unified Vision: Complementary Frameworks](#the-unified-vision-complementary-frameworks)
5. [Proposed Architecture](#proposed-architecture)
6. [Implementation Details](#implementation-details)
7. [Evaluation Framework](#evaluation-framework)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Success Metrics](#success-metrics)
10. [Resources & Documentation](#resources--documentation)

---

## Executive Summary

### Key Insight

**LangChain and Google ADK are not competing technologies—they are complementary.**

| Framework | Role | Purpose | Cost |
|-----------|------|---------|------|
| **LangChain/LangGraph** | The Brain | Build intelligent, tool-using, stateful agents | **FREE** (MIT) |
| **Google ADK** | The Quality Shell | Test, evaluate, and ensure reliability | **FREE** (Apache 2.0) |
| **Inference Layer** | The Engine | Fast, cost-effective inference | **FREE → Pay-as-grow** |

### Budget-First Philosophy

> **"Don't pay until you're making money."**

| Phase | Inference | Cost/Month |
|-------|-----------|------------|
| **Development** | Gemini CLI (1000/day) + Ollama (local) | **$0** |
| **MVP Testing** | Gemini free tier | **$0** |
| **Early Users** | Groq (pay-per-use) | **$10-50** |
| **Scale** | Groq / Replicate | **Usage-based** |

### Why Both?

For an educational tool aiming for MIT/Harvard-level teaching:
- A student won't **trust** a tutor that gives wrong answers → Need ADK evaluation
- A student won't **engage** with a tutor that can't reason deeply → Need LangChain

### Bottom Line

- **LangChain** makes the agent **smart** (FREE)
- **ADK** makes the agent **reliable** (FREE)
- **Together** they enable democratized, world-class education
- **All tools are open-source** with zero recurring costs until revenue

---

## Current Architecture

### Existing Stack

```
ai-tutor-mvp/
├── app/
│   ├── page.tsx              # Main split-view layout (Canvas + Chat)
│   ├── api/chat/route.ts     # Groq LLM API endpoint
│   └── layout.tsx, globals.css
├── components/
│   ├── AutomataCanvas.tsx    # ReactFlow-based DFA/NFA builder
│   ├── ChatInterface.tsx     # Socratic tutor chat UI
│   ├── SelfLoopEdge.tsx      # Custom edge for self-loops
│   ├── ProblemDisplay.tsx    # Problem context display
│   └── UserInputPanel.tsx    # User input handling
└── package.json (15 dependencies)
```

### Current Capabilities

| Feature | Implementation |
|---------|---------------|
| **Visual Canvas** | ReactFlow with custom StateNode, dagre auto-layout |
| **AI Tutor** | Groq API (LLaMA 3.3 70B) with structured JSON responses |
| **AI Drawing** | Tutor issues `drawCommands` to build automata visually |
| **Markdown + Math** | react-markdown, KaTeX for formulas |
| **Resizable UI** | Drag-to-resize sidebar |

### Current Limitations

1. **No conversation memory** - Each session starts fresh
2. **No adaptive difficulty** - Same approach for all students
3. **No tool use** - Can't solve math, run code, or search web
4. **No quality assurance** - No way to verify Socratic method adherence
5. **No modularity** - Single monolithic tutor, hard to extend

---

## Framework Analysis

### Google ADK (Agent Development Kit)

#### Overview

Google ADK is an open-source, code-first framework launched at Cloud NEXT 2025 for building sophisticated AI agents and multi-agent systems. It's the same framework powering Google's production agents in Agentspace and Customer Engagement Suite.

#### Current Status (December 2025)

| Language | Version | Status |
|----------|---------|--------|
| Python | v1.19.0 | Stable, production-ready |
| JavaScript/TypeScript | v0.1.0 | Early development, NOT production-ready |
| Java | v0.4.0 | Stable |
| Go | v0.2.0 | Stable |

#### Core Components

1. **Agents** - Central decision-making entities
   - LLM Agents: Dynamic reasoning using language models
   - Workflow Agents: Deterministic orchestration (Sequential, Parallel, Loop)
   - Custom Agents: Specialized logic

2. **Tools** - Agent capabilities
   - Pre-built: Google Search, Code Execution, Tavily, Firecrawl
   - Custom Functions: Python/TypeScript with type hints
   - OpenAPI Specs: Auto-generate from API definitions
   - MCP Tools: Model Context Protocol integration

3. **Runners** - Execution orchestration
   - Event stream management
   - Workflow coordination

4. **Sessions** - State management
   - InMemorySessionService (dev)
   - Firestore-backed (production)
   - Custom implementations

5. **Events** - Communication protocol
   - text, thought, tool_call, agent_transfer, error

#### Key Features for Education

| Feature | Benefit for AI Tutor |
|---------|---------------------|
| **AgentEvaluator** | Test Socratic method adherence, accuracy |
| **AgentLoader** | Modular tutors (Automata, Proof, Complexity) |
| **Hierarchical Agents** | Supervisor pattern for specialist routing |
| **Streaming** | Real-time token streaming for engagement |
| **Human-in-the-Loop** | Quality control for educational content |
| **A2A Protocol** | Inter-agent communication standard |

#### Strengths

- Native multi-agent orchestration
- Built-in evaluation framework
- Production-ready deployment (Vertex AI)
- Google Cloud ecosystem integration
- Model-agnostic (works with Groq via LiteLLM)

#### Limitations

- TypeScript/JavaScript not production-ready
- Newer framework, smaller community
- Documentation emphasizes Google Cloud
- Learning curve for new concepts

#### Documentation

- Main Docs: https://google.github.io/adk-docs/
- Python SDK: https://github.com/google/adk-python
- JavaScript SDK: https://github.com/google/adk-js
- Samples: https://github.com/google/adk-samples

---

### LangChain/LangGraph

#### Overview

**LangChain** is the world's most popular open-source framework (90M+ monthly downloads) for building LLM applications with pre-built agent architecture and 100+ model integrations.

**LangGraph** is a low-level, graph-based orchestration framework for building stateful, multi-agent AI systems. It's the evolution of LangChain, recommended by the team for all new agent implementations in 2025.

#### Key Differentiator

LangGraph enables you to define the tutor's behavior as a **state machine**:
- Implement pedagogical strategies explicitly
- Maintain contextual memory across sessions
- Make intelligent routing decisions
- Track student understanding and progress

#### Core Capabilities

1. **Tool Use**
   - WolframAlpha for math solving
   - Python REPL for code execution
   - Web search for definitions/examples
   - Custom tools (automata builder)

2. **Stateful Conversations**
   - Checkpointer for session persistence
   - Student progress tracking
   - Mastery scores per topic

3. **Conditional Routing**
   - Route based on understanding level
   - Adaptive difficulty adjustment
   - Specialist agent delegation

4. **Streaming**
   - Real-time token streaming
   - Server-Sent Events (SSE)
   - Next.js integration

#### Integration with Current Stack

| Component | LangChain Support |
|-----------|------------------|
| Groq LLaMA 3.3 | Official `@langchain/groq` package |
| Next.js 16 | Official template, streaming API routes |
| React 19 | Full TypeScript support |
| ReactFlow | Graph-based paradigm compatibility |

#### Strengths

- Largest community (90M downloads, 5.7k stars)
- Production deployments (Uber, LinkedIn, Replit)
- Excellent Next.js/TypeScript support
- Official Groq integration
- Rich tool ecosystem (100+ integrations)
- LangSmith observability platform

#### Limitations

- Steep learning curve (graph theory, state machines)
- Debugging complexity
- API instability (though improving)
- Monitoring overhead

#### Documentation

- Main Docs: https://docs.langchain.com/
- LangGraph: https://langchain-ai.github.io/langgraph/
- LangChain Academy: https://academy.langchain.com/
- Next.js Template: https://github.com/langchain-ai/langchain-nextjs-template

---

## The Unified Vision: Complementary Frameworks

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEMOCRATIZED EDUCATION STACK                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    GOOGLE ADK (Engineering Shell)                    │   │
│   │                                                                      │   │
│   │   • AgentLoader - Modular tutor loading                             │   │
│   │   • AgentEvaluator - Quality assurance (TEST SUITES)                │   │
│   │   • Environment management (.env, caching)                          │   │
│   │   • A2A Protocol - Inter-agent communication                        │   │
│   │                                                                      │   │
│   │   ┌──────────────────────────────────────────────────────────────┐  │   │
│   │   │              LANGCHAIN/LANGGRAPH (Intelligent Brain)          │  │   │
│   │   │                                                               │  │   │
│   │   │   • Tool Use (WolframAlpha, Code Execution, Web Search)      │  │   │
│   │   │   • LangGraph State Machine (Pedagogical Strategies)         │  │   │
│   │   │   • Long-term Memory (Student Progress, Knowledge Graph)     │  │   │
│   │   │   • Conditional Routing (Adaptive Difficulty)                │  │   │
│   │   │                                                               │  │   │
│   │   │   ┌───────────────────────────────────────────────────────┐  │  │   │
│   │   │   │              GROQ (LLaMA 3.3 70B)                      │  │  │   │
│   │   │   │              Fast, Cost-Effective Inference            │  │  │   │
│   │   │   └───────────────────────────────────────────────────────┘  │  │   │
│   │   │                                                               │  │   │
│   │   └──────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Role Distribution

| Concern | LangChain/LangGraph | Google ADK |
|---------|---------------------|------------|
| **Intelligence** | ✅ Chains, tools, reasoning | Orchestration only |
| **Quality Assurance** | Basic (LangSmith) | ✅ AgentEvaluator, test suites |
| **Modularity** | Custom structure | ✅ AgentLoader, standardized |
| **State Management** | ✅ LangGraph checkpointer | Basic sessions |
| **Tool Use** | ✅ 100+ integrations | Limited |
| **Production Ops** | Manual setup | ✅ Best practices built-in |

### Comparison Matrix

| Dimension | Google ADK | LangChain/LangGraph | Winner |
|-----------|-----------|---------------------|--------|
| **Maturity** | New (2025), v1.19 Python | Mature (2023+), 90M downloads | LangChain |
| **Next.js Integration** | Limited (JS v0.1 alpha) | Excellent (official template) | LangChain |
| **Groq Support** | Via LiteLLM (indirect) | Official `@langchain/groq` | LangChain |
| **Multi-Agent** | Native hierarchical | Supervisor/Network patterns | Tie |
| **State Persistence** | InMemory/Firestore | PostgreSQL/Redis/SQLite | Tie |
| **Streaming** | Built-in SSE | Built-in SSE | Tie |
| **Learning Curve** | Medium | Steep (but well-documented) | ADK |
| **Community** | Growing (Google-backed) | Largest (5.7k stars, 2.5k contributors) | LangChain |
| **TypeScript** | Not production-ready | Full TypeScript support | LangChain |
| **Educational AI** | Few examples | LangChain-Teacher, SocraticLLM | LangChain |
| **Evaluation** | ✅ AgentEvaluator | Basic | ADK |
| **Production Deployments** | Agentspace (Google internal) | Uber, LinkedIn, Replit | LangChain |

---

## Proposed Architecture

### Project Structure

```
ai-tutor-mvp/
├── app/                              # Next.js 16 Frontend
│   ├── page.tsx                      # Main UI (ReactFlow + Chat)
│   └── api/
│       └── chat/route.ts             # Proxies to Python backend
│
├── agents/                           # Google ADK Structure
│   ├── __init__.py
│   ├── tutors/
│   │   ├── automata_tutor/           # Specialized Tutor
│   │   │   ├── agent.py              # LangGraph agent definition
│   │   │   ├── tools.py              # DFA builder, regex tester
│   │   │   ├── prompts.py            # Socratic system prompts
│   │   │   └── agent.test.json       # ADK evaluation test cases
│   │   │
│   │   ├── proof_tutor/              # Proof/Logic Specialist
│   │   │   ├── agent.py
│   │   │   ├── tools.py              # WolframAlpha, SymPy
│   │   │   └── agent.test.json
│   │   │
│   │   └── complexity_tutor/         # P/NP/Big-O Specialist
│   │       ├── agent.py
│   │       ├── tools.py              # Code execution, benchmarks
│   │       └── agent.test.json
│   │
│   ├── meta_tutor/                   # Supervisor/Router
│   │   ├── agent.py                  # LangGraph supervisor
│   │   └── agent.test.json           # Routing accuracy tests
│   │
│   └── loader.py                     # ADK AgentLoader wrapper
│
├── evaluation/                       # ADK Evaluation Framework
│   ├── test_suites/
│   │   ├── socratic_method.test.json
│   │   ├── accuracy.test.json
│   │   └── pedagogy.test.json
│   ├── evaluator.py                  # ADK AgentEvaluator
│   └── metrics.py                    # Custom education metrics
│
├── server/                           # FastAPI Backend
│   ├── main.py                       # API endpoints
│   └── streaming.py                  # SSE streaming
│
├── lib/                              # LangChain/LangGraph Core
│   ├── graphs/
│   │   ├── socratic_graph.py         # Main tutoring state machine
│   │   └── evaluation_graph.py       # Self-critique loop
│   ├── tools/
│   │   ├── wolfram.py                # Math solving
│   │   ├── code_executor.py          # Python REPL
│   │   ├── web_search.py             # DuckDuckGo/Wikipedia
│   │   └── automata_builder.py       # ReactFlow draw commands
│   ├── memory/
│   │   ├── student_state.py          # Knowledge tracking
│   │   └── checkpointer.py           # LangGraph persistence
│   └── chains/
│       ├── socratic_chain.py         # Guiding question generation
│       └── assessment_chain.py       # Understanding evaluation
│
├── components/                       # React Components (existing)
├── docs/                             # Documentation
│   └── AGENT_FRAMEWORK_ARCHITECTURE.md
└── package.json
```

### Multi-Agent System Design

```
┌────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 FRONTEND                             │
│  ┌──────────────────┐  ┌─────────────────────────────────────────┐│
│  │  ReactFlow       │  │  Chat Interface                         ││
│  │  Automata Canvas │  │  - Streaming responses                  ││
│  │  - DFA/NFA viz   │  │  - Markdown + KaTeX                     ││
│  │  - AI draw cmds  │  │  - Problem context                      ││
│  └──────────────────┘  └─────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
                              ↓ API
┌────────────────────────────────────────────────────────────────────┐
│                  LANGGRAPH ORCHESTRATION LAYER                     │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    META-TUTOR (Supervisor)                    │ │
│  │  - Analyzes student questions                                 │ │
│  │  - Routes to specialist agents                                │ │
│  │  - Manages Socratic dialogue flow                             │ │
│  │  - Tracks understanding level                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                    ↓         ↓         ↓         ↓                 │
│  ┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐     │
│  │  AUTOMATA   ││   PROOF     ││  CONCEPT    ││   QUIZ      │     │
│  │   EXPERT    ││  ASSISTANT  ││  EXPLAINER  ││  GENERATOR  │     │
│  │             ││             ││             ││             │     │
│  │ - DFA/NFA   ││ - Pumping   ││ - Socratic  ││ - Generate  │     │
│  │ - Regex     ││   Lemma     ││   questions ││   problems  │     │
│  │ - Draw cmds ││ - Induction ││ - Analogies ││ - Assess    │     │
│  └─────────────┘└─────────────┘└─────────────┘└─────────────┘     │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    STATE MANAGEMENT                           │ │
│  │  - Student progress (completedConcepts, struggleAreas)       │ │
│  │  - Conversation history (persists across sessions)           │ │
│  │  - Mastery scores (per topic)                                │ │
│  │  - Learning style preferences                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                    GROQ API (LLaMA 3.3 70B)                        │
│                    Fast inference at $0.59/M tokens                │
└────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. LangGraph Agent (The Brain)

```python
# lib/graphs/socratic_graph.py
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Annotated, Literal
from langchain_core.messages import HumanMessage, AIMessage
from lib.tools.wolfram import wolfram_tool
from lib.tools.code_executor import python_repl_tool
from lib.tools.automata_builder import draw_automata_tool

class StudentState(TypedDict):
    """Tracks student's learning journey"""
    messages: Annotated[list, "Conversation history"]
    problem_context: str
    canvas_state: dict
    draw_commands: list
    understanding_level: Literal["confused", "progressing", "mastered"]
    attempts: int
    topic: str
    mastery_scores: dict  # {"DFA": 0.8, "NFA": 0.6, ...}

# Initialize LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.7,
    api_key=os.environ["GROQ_API_KEY"]
)

# Bind tools to LLM
tools = [wolfram_tool, python_repl_tool, draw_automata_tool]
llm_with_tools = llm.bind_tools(tools)

# === NODES ===

def assess_understanding(state: StudentState) -> StudentState:
    """Evaluate student's current understanding level"""
    last_response = state["messages"][-1].content if state["messages"] else ""

    if "I don't understand" in last_response or state["attempts"] > 3:
        return {**state, "understanding_level": "confused"}
    elif "so it means" in last_response.lower() or "because" in last_response.lower():
        return {**state, "understanding_level": "progressing"}
    else:
        return {**state, "understanding_level": "confused"}

def socratic_question(state: StudentState) -> StudentState:
    """Generate guiding question (NOT direct answer)"""
    system_prompt = """You are a Socratic tutor. NEVER give direct answers.

    Current understanding: {understanding}
    Attempts so far: {attempts}

    If student is confused after 3+ attempts, provide a simpler analogy.
    If student is progressing, ask a deeper "why" question.
    If student demonstrates mastery, present a harder challenge.

    Always respond with JSON:
    {{"content": "your response", "drawCommands": [...]}}
    """

    response = llm_with_tools.invoke([
        {"role": "system", "content": system_prompt.format(
            understanding=state["understanding_level"],
            attempts=state["attempts"]
        )},
        *state["messages"]
    ])

    parsed = json.loads(response.content)

    return {
        **state,
        "messages": state["messages"] + [AIMessage(content=parsed["content"])],
        "draw_commands": parsed.get("drawCommands", []),
        "attempts": state["attempts"] + 1
    }

def provide_hint(state: StudentState) -> StudentState:
    """Provide progressive hint (when student is stuck)"""
    hint_level = min(state["attempts"], 5)

    system_prompt = f"""Student is stuck (attempt {state['attempts']}).
    Provide hint level {hint_level}/5:
    - Level 1: Rephrase the question
    - Level 2: Provide an analogy
    - Level 3: Break into smaller steps
    - Level 4: Give a partial example
    - Level 5: Walk through solution with questions
    """

    response = llm.invoke([
        {"role": "system", "content": system_prompt},
        *state["messages"]
    ])

    return {
        **state,
        "messages": state["messages"] + [AIMessage(content=response.content)]
    }

def use_tool(state: StudentState) -> StudentState:
    """Execute tool (math solver, code runner, automata builder)"""
    response = llm_with_tools.invoke(state["messages"])
    return {
        **state,
        "messages": state["messages"] + [response]
    }

# === ROUTING ===

def route_by_understanding(state: StudentState) -> Literal["question", "hint", "tool", "end"]:
    """Decide next step based on student state"""
    last_message = state["messages"][-1].content.lower() if state["messages"] else ""

    if any(keyword in last_message for keyword in ["calculate", "solve", "draw", "show me", "run code"]):
        return "tool"

    if state["understanding_level"] == "confused" and state["attempts"] >= 3:
        return "hint"
    elif state["understanding_level"] == "mastered":
        return "end"
    else:
        return "question"

# === BUILD GRAPH ===

workflow = StateGraph(StudentState)

workflow.add_node("assess", assess_understanding)
workflow.add_node("question", socratic_question)
workflow.add_node("hint", provide_hint)
workflow.add_node("tool", use_tool)

workflow.add_edge("__start__", "assess")
workflow.add_conditional_edges(
    "assess",
    route_by_understanding,
    {
        "question": "question",
        "hint": "hint",
        "tool": "tool",
        "end": END
    }
)
workflow.add_edge("question", END)
workflow.add_edge("hint", END)
workflow.add_edge("tool", "assess")

checkpointer = MemorySaver()
socratic_tutor = workflow.compile(checkpointer=checkpointer)
```

### 2. ADK Wrapper (The Quality Shell)

```python
# agents/tutors/automata_tutor/agent.py
"""
ADK-wrapped LangGraph agent for Automata Theory tutoring.
Provides standardized loading, evaluation, and management.
"""
from google.adk.agents import Agent
from google.adk.tools import Tool
from lib.graphs.socratic_graph import socratic_tutor

class AutomataTutor(Agent):
    """Socratic tutor for DFA, NFA, Regular Languages"""

    name = "automata_tutor"
    description = "Teaches finite automata using the Socratic method"

    def __init__(self):
        super().__init__()
        self.graph = socratic_tutor
        self.tools = [
            Tool.from_function(self.draw_dfa),
            Tool.from_function(self.check_regex),
            Tool.from_function(self.simulate_input)
        ]

    async def run(self, query: str, session_id: str) -> dict:
        """Execute the LangGraph tutor"""
        result = await self.graph.ainvoke(
            {"messages": [{"role": "user", "content": query}]},
            config={"configurable": {"thread_id": session_id}}
        )
        return {
            "content": result["messages"][-1].content,
            "draw_commands": result.get("draw_commands", [])
        }

    def draw_dfa(self, states: list, transitions: list, accept_states: list) -> dict:
        """Generate ReactFlow draw commands for DFA visualization"""
        commands = []
        for i, state in enumerate(states):
            commands.append({
                "type": "addState",
                "label": state,
                "isStart": i == 0,
                "isAccept": state in accept_states
            })
        for trans in transitions:
            commands.append({
                "type": "addTransition",
                "from": trans["from"],
                "to": trans["to"],
                "symbol": trans["symbol"]
            })
        return {"drawCommands": commands}
```

### 3. Next.js API Route

```typescript
// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { tutorGraph } from "@/lib/tutor-agent";

export async function POST(req: Request) {
  const { messages, problemContext, canvasContext, sessionId } = await req.json();

  const lastUserMessage = messages[messages.length - 1];

  const result = await tutorGraph.invoke(
    {
      messages: [new HumanMessage(lastUserMessage.content)],
      problemContext,
      canvasState: canvasContext,
    },
    {
      configurable: { thread_id: sessionId || "default" },
    }
  );

  const aiMessage = result.messages[result.messages.length - 1];

  return NextResponse.json({
    content: aiMessage.content,
    drawCommands: result.drawCommands,
  });
}
```

### 4. Streaming API Route

```typescript
// app/api/chat/stream/route.ts
import { tutorGraph } from "@/lib/tutor-agent";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  const { message, problemContext, canvasContext, sessionId } = await req.json();

  const stream = await tutorGraph.stream(
    {
      messages: [new HumanMessage(message)],
      problemContext,
      canvasState: canvasContext,
    },
    {
      configurable: { thread_id: sessionId },
      streamMode: "values",
    }
  );

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const data = JSON.stringify(chunk);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

---

## Evaluation Framework

### ADK Test Suite

```json
// agents/tutors/automata_tutor/agent.test.json
{
  "name": "Automata Tutor Evaluation Suite",
  "version": "1.0",
  "tests": [
    {
      "name": "Socratic Method Adherence",
      "description": "Tutor should ask questions, not give direct answers",
      "input": "What is a DFA?",
      "expected": {
        "response_match": {
          "should_not_contain": ["A DFA is", "DFA stands for", "Definition:"],
          "should_contain_pattern": "\\?"
        }
      }
    },
    {
      "name": "Progressive Hints",
      "description": "After 3 wrong attempts, tutor should provide simpler explanation",
      "setup": {
        "attempts": 3,
        "understanding_level": "confused"
      },
      "input": "I still don't get it",
      "expected": {
        "response_match": {
          "should_contain_any": ["think of it like", "imagine", "analogy", "simpler"]
        }
      }
    },
    {
      "name": "Tool Use - DFA Drawing",
      "description": "Tutor should draw automata when asked",
      "input": "Can you draw a DFA that accepts strings ending in 'ab'?",
      "expected": {
        "tool_trajectory": ["draw_dfa"],
        "response_has_key": "drawCommands"
      }
    },
    {
      "name": "Accuracy - Regex to DFA",
      "description": "Tutor should produce correct automata",
      "input": "Convert the regex (a|b)*abb to a DFA",
      "expected": {
        "custom_metric": "verify_dfa_accepts_language",
        "test_strings": {
          "accept": ["abb", "aabb", "babb", "ababb"],
          "reject": ["ab", "a", "b", ""]
        }
      }
    },
    {
      "name": "Mastery Detection",
      "description": "Tutor should recognize when student understands",
      "input": "So the DFA needs 4 states because we need to track the last two symbols, right?",
      "expected": {
        "state_after": {
          "understanding_level": "progressing"
        },
        "response_match": {
          "should_contain_any": ["exactly", "correct", "yes", "good thinking"]
        }
      }
    }
  ],
  "metrics": [
    {
      "name": "socratic_score",
      "description": "Percentage of responses that are questions",
      "threshold": 0.7
    },
    {
      "name": "accuracy_score",
      "description": "Correctness of automata/proofs generated",
      "threshold": 0.95
    },
    {
      "name": "pedagogical_score",
      "description": "Appropriate difficulty adaptation",
      "threshold": 0.8
    }
  ]
}
```

### Evaluation Runner

```python
# evaluation/evaluator.py
from google.adk.evaluation import AgentEvaluator
from agents.loader import load_agent
import json

class TutorEvaluator:
    """Runs ADK evaluation suite on LangGraph tutors"""

    def __init__(self, agent_name: str):
        self.agent = load_agent(agent_name)
        self.evaluator = AgentEvaluator(self.agent)

    async def run_suite(self, test_file: str) -> dict:
        """Execute all tests in a suite"""
        with open(test_file) as f:
            suite = json.load(f)

        results = {
            "passed": 0,
            "failed": 0,
            "tests": []
        }

        for test in suite["tests"]:
            result = await self.run_single_test(test)
            results["tests"].append(result)
            if result["passed"]:
                results["passed"] += 1
            else:
                results["failed"] += 1

        results["metrics"] = self.calculate_metrics(results["tests"], suite["metrics"])

        return results

    async def run_single_test(self, test: dict) -> dict:
        """Run a single test case"""
        if "setup" in test:
            self.agent.set_state(test["setup"])

        response = await self.agent.run(test["input"], session_id="test")
        passed = self.evaluate_response(response, test["expected"])

        return {
            "name": test["name"],
            "passed": passed,
            "input": test["input"],
            "response": response,
            "expected": test["expected"]
        }

    def evaluate_response(self, response: dict, expected: dict) -> bool:
        """Check if response meets expectations"""
        content = response.get("content", "")

        if "response_match" in expected:
            match = expected["response_match"]
            if "should_not_contain" in match:
                for phrase in match["should_not_contain"]:
                    if phrase.lower() in content.lower():
                        return False
            if "should_contain_pattern" in match:
                import re
                if not re.search(match["should_contain_pattern"], content):
                    return False

        return True

    def calculate_metrics(self, tests: list, metric_defs: list) -> dict:
        """Calculate aggregate metrics"""
        metrics = {}
        for metric in metric_defs:
            if metric["name"] == "socratic_score":
                questions = sum(1 for t in tests if "?" in t["response"].get("content", ""))
                metrics["socratic_score"] = questions / len(tests)
        return metrics

# Usage
async def run_evaluation():
    evaluator = TutorEvaluator("automata_tutor")
    results = await evaluator.run_suite("agents/tutors/automata_tutor/agent.test.json")

    print(f"Passed: {results['passed']}/{results['passed'] + results['failed']}")
    print(f"Socratic Score: {results['metrics']['socratic_score']:.2%}")

    if results['metrics']['socratic_score'] < 0.7:
        raise Exception("Socratic score below threshold!")
```

---

## Implementation Roadmap

### Phase 1: LangChain Foundation (Week 1-2)

**Goal**: Validate LangGraph integration with ZERO breaking changes

**Tasks**:
- [ ] Install `@langchain/groq`, `@langchain/langgraph`
- [ ] Migrate current Groq SDK to LangChain
- [ ] Add conversation memory (MemorySaver)
- [ ] Add first tool (automata_builder)
- [ ] Validate: Same UX, better context retention

**Success Criteria**:
- Same UX, better conversation context
- Student can continue from where they left off
- Response quality improves with memory

### Phase 2: LangGraph State Machine (Week 3-4)

**Goal**: Track student progress across sessions

**Tasks**:
- [ ] Implement StudentState schema
- [ ] Build Socratic routing logic (assess → question/hint/tool)
- [ ] Add understanding_level tracking
- [ ] Add mastery_scores persistence
- [ ] Validate: Adaptive difficulty works

**Success Criteria**:
- "Welcome back! Last time you were working on NFAs..."
- Harder questions for students who demonstrate understanding
- Easier questions/hints for struggling students

### Phase 3: ADK Quality Shell (Week 5-6)

**Goal**: Ensure quality and reliability

**Tasks**:
- [ ] Set up ADK project structure
- [ ] Wrap LangGraph agent in ADK Agent class
- [ ] Create initial test suite (10 test cases)
- [ ] Implement AgentEvaluator
- [ ] Add CI pipeline for evaluation
- [ ] Validate: 70%+ Socratic score, 95%+ accuracy

**Success Criteria**:
- All tests pass in CI
- Socratic score ≥ 70%
- Accuracy score ≥ 95%

### Phase 4: Tool Expansion (Week 7-8)

**Goal**: Add advanced capabilities

**Tasks**:
- [ ] Add WolframAlpha tool (math solving)
- [ ] Add Python REPL tool (code execution)
- [ ] Add web search tool (definitions, examples)
- [ ] Expand test suites for each tool
- [ ] Validate: Tools used appropriately

**Success Criteria**:
- Math problems solved step-by-step
- Code can be executed and explained
- Definitions pulled from reliable sources

### Phase 5: Multi-Agent Specialists (Week 9-10)

**Goal**: Specialized tutors for deep expertise

**Tasks**:
- [ ] Create proof_tutor agent
- [ ] Create complexity_tutor agent
- [ ] Implement meta_tutor supervisor
- [ ] Add A2A protocol for agent communication
- [ ] Validate: Correct routing to specialists

**Success Criteria**:
- Complex questions routed to specialists
- Each agent maintains persona consistency
- Seamless handoff between agents

### Phase 6: Production (Week 11-12)

**Goal**: Ready for real students

**Tasks**:
- [ ] PostgreSQL persistence
- [ ] LangSmith observability
- [ ] Human-in-the-loop flagging
- [ ] Deploy to Vercel + Railway
- [ ] Continuous evaluation in production

**Success Criteria**:
- 99.9% uptime
- <2s average response time
- Ability to review flagged conversations

---

## Success Metrics

### Phase-by-Phase Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 1 | Response quality | ≥ current baseline |
| Phase 1 | Context retention | Student can reference earlier conversation |
| Phase 2 | Returning students | 30% continue from previous session |
| Phase 2 | Adaptive difficulty | 80% of hints are appropriate level |
| Phase 3 | Socratic score | ≥ 70% |
| Phase 3 | Accuracy score | ≥ 95% |
| Phase 4 | Tool use accuracy | 90% correct tool selection |
| Phase 5 | Specialist routing | 90% accuracy in topic detection |
| Phase 6 | Uptime | 99.9% |
| Phase 6 | Response latency | <2 seconds |

### Risk Assessment

| Risk | Probability | Mitigation |
|------|-------------|------------|
| LangGraph learning curve delays | 40% | Start with Phase 1 only, validate before expanding |
| Groq rate limits at scale | 30% | Monitor usage, implement queuing if needed |
| Over-engineering | 25% | Strict adherence to "Core First" |
| State management complexity | 20% | Use InMemory first, migrate to PostgreSQL only when needed |
| Response quality regression | 15% | A/B test new agent vs. current implementation |

### Kill Criteria

**Stop and reassess if**:
- Phase 1 takes >3 weeks (complexity signal)
- Student feedback shows quality regression
- Token costs increase >3x without proportional value
- Team cannot maintain the added complexity

---

## Resources & Documentation

### LangChain/LangGraph

- **Main Docs**: https://docs.langchain.com/
- **LangGraph Tutorial**: https://langchain-ai.github.io/langgraph/
- **LangChain Academy**: https://academy.langchain.com/
- **Next.js Template**: https://github.com/langchain-ai/langchain-nextjs-template
- **Groq Integration**: https://console.groq.com/docs/langchain

### Google ADK

- **Main Docs**: https://google.github.io/adk-docs/
- **Python SDK**: https://github.com/google/adk-python
- **JavaScript SDK**: https://github.com/google/adk-js
- **Samples**: https://github.com/google/adk-samples
- **A2A Protocol**: https://github.com/google/A2A

### Educational AI Research

- **SocraticLLM**: https://arxiv.org/abs/2407.17349
- **LangChain-Teacher**: https://github.com/langchain-ai/langchain-teacher
- **Socratic Code Debugging**: Research on guided debugging

### Production Deployment

- **LangGraph Cloud**: Fully managed deployment
- **Vertex AI Agent Engine**: Google Cloud deployment
- **Self-Hosted Guide**: Kubernetes/Docker deployment

---

## Zero-Cost Implementation Stack

### The Budget-Conscious Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  Next.js on Vercel FREE tier                                │
│  (100GB bandwidth, unlimited deploys)                       │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────┐
│                      AGENT LAYER                            │
│  LangGraph (MIT License) - FREE                             │
│  Google ADK Evaluation (Apache 2.0) - FREE                  │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────┐
│                   INFERENCE LAYER                           │
│  Development: Gemini CLI (1000 req/day FREE)                │
│  Local Testing: Ollama (unlimited, FREE)                    │
│  Production: Groq pay-per-use (when revenue exists)         │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────┐
│                     MEMORY LAYER                            │
│  ChromaDB (Apache 2.0) - FREE, local                        │
│  sentence-transformers embeddings - FREE                    │
│  SQLite for metadata - FREE                                 │
└─────────────────────────────────────────────────────────────┘
```

### Monthly Cost Breakdown: $0

| Component | Tool | Monthly Cost |
|-----------|------|--------------|
| Frontend | Vercel Hobby | $0 |
| Agent Framework | LangGraph | $0 |
| Evaluation | Google ADK | $0 |
| LLM (dev) | Gemini CLI | $0 |
| LLM (local) | Ollama | $0 |
| Vector DB | ChromaDB | $0 |
| Embeddings | sentence-transformers | $0 |
| **TOTAL** | | **$0** |

### Migration Path: When Revenue Arrives

| Revenue | Upgrade | New Cost |
|---------|---------|----------|
| $0 | Current stack | $0/mo |
| $100/mo | Groq for speed | ~$20/mo |
| $500/mo | Pinecone for scale | ~$50/mo |
| $2000/mo | Full production stack | ~$200/mo |

---

## Conclusion

The combination of **LangChain/LangGraph** (intelligent brain) and **Google ADK** (quality shell) provides the optimal architecture for building a world-class, MIT/Harvard-level AI tutor **at ZERO cost**.

**Key Takeaways**:

1. **LangChain** enables tool use, stateful conversations, and adaptive teaching (FREE - MIT License)
2. **Google ADK** ensures quality, enables modular specialists, and enforces best practices (FREE - Apache 2.0)
3. **Inference is flexible**: Start with Gemini CLI + Ollama (FREE), scale to Groq when profitable
4. **Incremental adoption** minimizes risk while building toward the vision
5. **All tools are open-source** - no vendor lock-in, no surprise bills

The roadmap follows the "Core First, Scale Second" philosophy:
- Validate each phase before expanding
- Maintain existing UX while adding capabilities
- Use evaluation to prove quality improvements
- **Don't pay until you're making money**

**The democratization of MIT-level education starts with a tutor that remembers, adapts, guides, and can prove it works correctly—all built on FREE, open-source tools.**

---

## Related Documents

- [FREE & Open-Source Tools Catalog](./FREE_OPENSOURCE_TOOLS.md) - Complete catalog of zero-cost tools
- [YouTube Knowledge Synthesis](./YOUTUBE_KNOWLEDGE_SYNTHESIS.md) - Insights from AI agent tutorials
- [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md) - Step-by-step tasks

---

*Document created: December 2025*
*Last updated: December 2025*
*Version: 1.1 - Budget-Conscious Edition*
