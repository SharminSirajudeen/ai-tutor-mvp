# AI Tutor MVP: Implementation Checklist (Revised)

**Objective:** This document outlines the specific tasks required to implement the architecture defined in `AGENT_FRAMEWORK_ARCHITECTURE.md`. It has been validated and corrected based on a thorough review.

**Version:** 2.0 (Validated)
**Last Updated:** December 2025
**Validated By:** APEX Project Manager

---

## Validation Summary

| Phase | Original Tasks | Revised Tasks | Changes |
|-------|----------------|---------------|---------|
| Phase 1 | 5 | 7 | +2 (streaming, tool impl) |
| Phase 2 | 5 | 7 | +2 (chains, validation) |
| Phase 3 | 5 | 8 | +3 (metrics, loader, test suites) |
| Phase 4 | 4 | 5 | +1 (validation) |
| Phase 5 | 3 | 6 | +3 (A2A, validation, handoff) |
| Phase 6 | 5 | 8 | +3 (HITL, monitoring, continuous eval) |

---

## Phase 1: LangChain Foundation (Week 1-2)

**Goal:** Validate LangGraph integration with ZERO breaking changes

**Status:** In Progress

### Environment Setup

- [x] **Task 1.1:** Set up Python backend environment
    - [x] Create `server/` directory
    - [x] Create `server/requirements.txt` with dependencies:
        - `langchain-groq`
        - `langgraph`
        - `langchain-core`
        - `fastapi`
        - `uvicorn`
        - `python-dotenv`
    - [x] Create `server/.env.example` template

- [x] **Task 1.2:** Implement basic FastAPI server in `server/main.py`
    - [x] Create health-check endpoint (`/health`)
    - [x] Set up CORS for Next.js frontend
    - [x] Configure environment variable loading

### LangGraph Core

- [x] **Task 1.3:** Create LangGraph agent structure
    - [x] Create directory structure:
        ```
        lib/
        ├── graphs/
        │   └── socratic_graph.py
        ├── tools/
        │   └── automata_builder.py    # NEW: Was missing
        ├── memory/
        │   ├── student_state.py
        │   └── checkpointer.py        # NEW: Was missing
        └── chains/                     # NEW: Was missing (skeleton)
        ```
    - [x] Define basic `StudentState` TypedDict in `student_state.py`
    - [x] Create skeleton `socratic_graph.py` with `StateGraph` and `MemorySaver`
    - [ ] **NEW:** Implement `automata_builder.py` tool for ReactFlow draw commands
    - [ ] **NEW:** Create `checkpointer.py` abstraction

- [ ] **Task 1.4:** Implement SSE Streaming *(NEW - was missing)*
    - [ ] Create `server/streaming.py` module
    - [ ] Implement `StreamingResponse` wrapper for LangGraph
    - [ ] Add `/api/v1/chat/stream` endpoint

### Integration

- [x] **Task 1.5:** Connect Next.js frontend to Python backend
    - [x] Create `/api/v1/chat` endpoint in `server/main.py`
    - [x] Modify `app/api/chat/route.ts` to proxy to Python backend
    - [ ] **NEW:** Verify `groq-sdk` is replaced with `langchain-groq`
    - [ ] **NEW:** Confirm existing draw commands still work

### Validation

- [ ] **Task 1.6:** End-to-end system test
    - [ ] Create `.env` file in `server/` with `GROQ_API_KEY`
    - [ ] Install Python dependencies: `pip install -r requirements.txt`
    - [ ] Run FastAPI server: `uvicorn server.main:app --reload`
    - [ ] Install npm dependencies: `npm install`
    - [ ] Run Next.js server: `npm run dev`
    - [ ] Verify chat functionality at `http://localhost:3000`
    - [ ] Verify automata drawing still works
    - [ ] Verify conversation context is maintained

- [ ] **Task 1.7:** Documentation *(NEW)*
    - [ ] Update README with new backend setup instructions
    - [ ] Document environment variables required

**Success Criteria:**
- [ ] Same UX as before migration
- [ ] Student can reference earlier parts of conversation
- [ ] Draw commands work correctly
- [ ] No regression in response quality

---

## Phase 2: LangGraph State Machine (Week 3-4)

**Goal:** Track student progress across sessions with adaptive difficulty

**Status:** Pending

### State Management

- [ ] **Task 2.1:** Fully implement `StudentState` schema
    - [ ] Add fields:
        ```python
        class StudentState(TypedDict):
            messages: Annotated[list, "Conversation history"]
            problem_context: str
            canvas_state: dict
            draw_commands: list
            understanding_level: Literal["confused", "progressing", "mastered"]
            attempts: int
            topic: str
            mastery_scores: dict  # {"DFA": 0.8, "NFA": 0.6, ...}
            session_id: str
            last_active: datetime
        ```

### Graph Nodes

- [ ] **Task 2.2:** Implement `assess_understanding` node
    - [ ] Analyze student response for understanding signals
    - [ ] Update `understanding_level` based on response analysis
    - [ ] Track `attempts` counter

- [ ] **Task 2.3:** Implement `socratic_question` node
    - [ ] Generate guiding questions (never direct answers)
    - [ ] Adjust complexity based on `understanding_level`
    - [ ] Include draw commands when visual explanation helps

- [ ] **Task 2.4:** Implement `provide_hint` node
    - [ ] Progressive hint levels (1-5):
        1. Rephrase the question
        2. Provide an analogy
        3. Break into smaller steps
        4. Give a partial example
        5. Walk through solution with questions
    - [ ] Trigger after 3+ failed attempts

- [ ] **Task 2.5:** Implement `use_tool` node
    - [ ] Handle tool invocation from LLM
    - [ ] Process tool results back into conversation

### Routing

- [ ] **Task 2.6:** Implement `route_by_understanding` conditional edges
    - [ ] Route to `question` for normal flow
    - [ ] Route to `hint` when confused + attempts >= 3
    - [ ] Route to `tool` when tool use requested
    - [ ] Route to `END` when mastery demonstrated

### Chains *(NEW - was missing from checklist)*

- [ ] **Task 2.7:** Implement supporting chains
    - [ ] Create `lib/chains/socratic_chain.py` for guiding question generation
    - [ ] Create `lib/chains/assessment_chain.py` for understanding evaluation

### Persistence

- [ ] **Task 2.8:** Persist state across requests
    - [ ] Save `mastery_scores` after each interaction
    - [ ] Save `understanding_level` history
    - [ ] Implement "Welcome back" message using saved state

### Testing

- [ ] **Task 2.9:** Write unit tests
    - [ ] Test `assess_understanding` node logic
    - [ ] Test `route_by_understanding` routing decisions
    - [ ] Test hint progression (levels 1-5)
    - [ ] Test state persistence across sessions

### Validation *(NEW - was missing)*

- [ ] **Task 2.10:** Manual validation scenarios
    - [ ] Verify: "Welcome back! Last time you were working on NFAs..."
    - [ ] Verify: Harder questions for demonstrating students
    - [ ] Verify: Easier hints for struggling students
    - [ ] Verify: Draw commands triggered appropriately

**Success Criteria:**
- [ ] Returning students see personalized greeting
- [ ] Difficulty adapts to understanding level
- [ ] Hint progression works correctly
- [ ] State persists across browser sessions

---

## Phase 3: ADK Quality Shell (Week 5-6)

**Goal:** Ensure quality and reliability through rigorous testing

**Status:** Pending

### Project Structure

- [ ] **Task 3.1:** Set up ADK project structure
    - [ ] Create directory structure:
        ```
        agents/
        ├── __init__.py
        ├── tutors/
        │   └── automata_tutor/
        │       ├── agent.py
        │       ├── tools.py
        │       ├── prompts.py
        │       └── agent.test.json
        └── loader.py              # NEW: Was missing

        evaluation/
        ├── test_suites/           # NEW: Was missing
        │   ├── socratic_method.test.json
        │   ├── accuracy.test.json
        │   └── pedagogy.test.json
        ├── evaluator.py
        └── metrics.py             # NEW: Was missing
        ```

### Agent Wrapper

- [ ] **Task 3.2:** Wrap LangGraph agent in ADK Agent class
    - [ ] Create `agents/tutors/automata_tutor/agent.py`
    - [ ] Implement `run()` method calling LangGraph
    - [ ] Implement tool wrappers in `tools.py`
    - [ ] Extract prompts to `prompts.py`

- [ ] **Task 3.3:** Implement AgentLoader *(NEW - was missing)*
    - [ ] Create `agents/loader.py`
    - [ ] Support dynamic agent loading by name
    - [ ] Handle agent configuration

### Test Suites

- [ ] **Task 3.4:** Create initial test suite (minimum 10 test cases)
    - [ ] Create `agent.test.json` with tests:
        1. Socratic method adherence (no direct answers)
        2. Question mark in responses
        3. Progressive hints after failures
        4. Tool use when requested (draw DFA)
        5. Accuracy of generated automata
        6. Mastery detection
        7. Confusion detection
        8. Appropriate difficulty adaptation
        9. Context retention across turns
        10. Edge case handling (empty input, etc.)

- [ ] **Task 3.5:** Create separate test suite files *(NEW - was missing)*
    - [ ] `evaluation/test_suites/socratic_method.test.json`
    - [ ] `evaluation/test_suites/accuracy.test.json`
    - [ ] `evaluation/test_suites/pedagogy.test.json`

### Evaluation Framework

- [ ] **Task 3.6:** Implement AgentEvaluator
    - [ ] Create `evaluation/evaluator.py`
    - [ ] Implement test case runner
    - [ ] Implement response matching logic
    - [ ] Generate evaluation reports

- [ ] **Task 3.7:** Implement custom metrics *(NEW - was missing)*
    - [ ] Create `evaluation/metrics.py`
    - [ ] Implement `socratic_score` calculation
    - [ ] Implement `accuracy_score` calculation
    - [ ] Implement `pedagogical_score` calculation

### CI/CD

- [ ] **Task 3.8:** Set up GitHub Actions workflow
    - [ ] Create `.github/workflows/evaluate.yml`
    - [ ] Run on push to main branch
    - [ ] Fail if scores below threshold
    - [ ] Generate and upload evaluation report

### Validation *(NEW - was missing)*

- [ ] **Task 3.9:** Run evaluation and verify thresholds
    - [ ] Socratic score ≥ 70%
    - [ ] Accuracy score ≥ 95%
    - [ ] All 10 test cases pass

**Success Criteria:**
- [ ] All tests pass in CI
- [ ] Socratic score ≥ 70%
- [ ] Accuracy score ≥ 95%
- [ ] Evaluation runs automatically on every push

---

## Phase 4: Tool Expansion (Week 7-8)

**Goal:** Add advanced capabilities for comprehensive tutoring

**Status:** Pending

### Mathematical Tools

- [ ] **Task 4.1:** Implement WolframAlpha tool
    - [ ] Create `lib/tools/wolfram.py`
    - [ ] Handle mathematical equation solving
    - [ ] Format step-by-step solutions
    - [ ] Add error handling for API failures

### Code Execution

- [ ] **Task 4.2:** Implement Python REPL tool
    - [ ] Create `lib/tools/code_executor.py`
    - [ ] Implement secure sandboxed execution
    - [ ] Capture stdout, stderr, return values
    - [ ] Add timeout protection
    - [ ] Support algorithm demonstrations

### Web Search

- [ ] **Task 4.3:** Implement web search tool
    - [ ] Create `lib/tools/web_search.py`
    - [ ] Integrate Tavily or DuckDuckGo API
    - [ ] Support definition lookups
    - [ ] Support example finding
    - [ ] Filter for educational content

### Testing

- [ ] **Task 4.4:** Expand ADK test suites
    - [ ] Add test cases for WolframAlpha tool
    - [ ] Add test cases for code execution tool
    - [ ] Add test cases for web search tool
    - [ ] Test tool selection accuracy

### Validation *(NEW - was missing)*

- [ ] **Task 4.5:** Manual tool validation
    - [ ] Verify: Math problems solved step-by-step
    - [ ] Verify: Code executes and results explained
    - [ ] Verify: Definitions from reliable sources
    - [ ] Verify: Tools used appropriately (not over-used)

**Success Criteria:**
- [ ] Math problems solved correctly with explanations
- [ ] Code execution works safely
- [ ] Web search returns relevant educational content
- [ ] Tools selected appropriately by LLM

---

## Phase 5: Multi-Agent Specialists (Week 9-10)

**Goal:** Specialized tutors for deep expertise in specific topics

**Status:** Pending

### Agent Creation

- [ ] **Task 5.1:** Create proof_tutor agent
    - [ ] Create `agents/tutors/proof_tutor/` directory structure:
        ```
        proof_tutor/
        ├── agent.py
        ├── tools.py          # WolframAlpha, SymPy integration
        ├── prompts.py
        └── agent.test.json
        ```
    - [ ] Specialize in: Pumping Lemma, Induction, Contradiction
    - [ ] Integrate with WolframAlpha and SymPy tools

- [ ] **Task 5.2:** Create complexity_tutor agent
    - [ ] Create `agents/tutors/complexity_tutor/` directory structure:
        ```
        complexity_tutor/
        ├── agent.py
        ├── tools.py          # Code execution, benchmarks
        ├── prompts.py
        └── agent.test.json
        ```
    - [ ] Specialize in: P vs NP, Big-O analysis, Reductions
    - [ ] Integrate with code execution tool

### Supervisor

- [ ] **Task 5.3:** Implement meta_tutor supervisor
    - [ ] Create `agents/meta_tutor/` directory:
        ```
        meta_tutor/
        ├── agent.py          # LangGraph supervisor
        └── agent.test.json   # Routing accuracy tests
        ```
    - [ ] Implement topic detection
    - [ ] Implement routing logic to specialists
    - [ ] Handle fallback to general tutor

### Inter-Agent Communication *(NEW - was missing)*

- [ ] **Task 5.4:** Implement A2A protocol
    - [ ] Define message schema for inter-agent communication
    - [ ] Implement handoff mechanism
    - [ ] Maintain conversation context across agents
    - [ ] Log agent transitions for debugging

### Testing

- [ ] **Task 5.5:** Update ADK evaluation suite
    - [ ] Add routing accuracy tests for meta_tutor
    - [ ] Add specialist-specific test cases
    - [ ] Test handoff quality

### Validation *(NEW - was missing)*

- [ ] **Task 5.6:** Manual multi-agent validation
    - [ ] Verify: Complex questions routed to specialists
    - [ ] Verify: Each agent maintains persona consistency
    - [ ] Verify: Seamless handoff between agents
    - [ ] Verify: Context preserved during handoff

**Success Criteria:**
- [ ] 90%+ routing accuracy
- [ ] Persona consistency across interactions
- [ ] Seamless handoffs (student doesn't notice transition)
- [ ] All specialist agents pass their test suites

---

## Phase 6: Production (Week 11-12)

**Goal:** Ready for real students with production-grade reliability

**Status:** Pending

### Persistence

- [ ] **Task 6.1:** Configure persistent checkpointer
    - [ ] Set up PostgreSQL database (or Redis)
    - [ ] Update `lib/memory/checkpointer.py` for production
    - [ ] Implement connection pooling
    - [ ] Add migration scripts

### Observability

- [ ] **Task 6.2:** Integrate LangSmith
    - [ ] Set up LangSmith project
    - [ ] Configure tracing in LangGraph
    - [ ] Set up alerting for errors
    - [ ] Create debugging dashboards

### Human-in-the-Loop *(NEW - was missing)*

- [ ] **Task 6.3:** Implement HITL system
    - [ ] Create flagging mechanism for uncertain responses
    - [ ] Build admin review dashboard
    - [ ] Implement feedback loop for model improvement
    - [ ] Set up notification system (Slack/email)

### Infrastructure

- [ ] **Task 6.4:** Research and select cloud provider
    - [ ] Evaluate: Railway, Render, AWS, GCP
    - [ ] Consider: Cost, GPU availability, scaling
    - [ ] Document decision and rationale

- [ ] **Task 6.5:** Create deployment scripts
    - [ ] Dockerize Python backend
    - [ ] Create `docker-compose.yml` for local testing
    - [ ] Create production deployment config
    - [ ] Set up CI/CD pipeline for deployments

### Deployment

- [ ] **Task 6.6:** Deploy frontend
    - [ ] Configure Vercel project
    - [ ] Set up environment variables
    - [ ] Configure custom domain (if applicable)
    - [ ] Set up preview deployments

- [ ] **Task 6.7:** Deploy backend
    - [ ] Deploy to chosen cloud provider
    - [ ] Configure SSL/TLS
    - [ ] Set up health checks
    - [ ] Configure auto-scaling

### Monitoring *(NEW - was missing)*

- [ ] **Task 6.8:** Set up production monitoring
    - [ ] Implement uptime monitoring
    - [ ] Set up error tracking (Sentry or similar)
    - [ ] Create performance dashboards
    - [ ] Configure alerting thresholds

### Continuous Evaluation *(NEW - was missing)*

- [ ] **Task 6.9:** Set up continuous evaluation in production
    - [ ] Schedule periodic evaluation runs
    - [ ] Track metric trends over time
    - [ ] Alert on score degradation
    - [ ] Implement A/B testing framework

**Success Criteria:**
- [ ] 99.9% uptime
- [ ] <2s average response time
- [ ] Flagged conversations reviewable
- [ ] Continuous evaluation running
- [ ] Alerts configured and tested

---

## Cross-Cutting Concerns

### Documentation

- [ ] Update README.md with complete setup instructions
- [ ] Document API endpoints
- [ ] Create architecture decision records (ADRs)
- [ ] Write user guide for tutoring interface

### Security

- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Secure API keys (never in code)
- [ ] Review OWASP top 10

### Performance

- [ ] Implement response caching where appropriate
- [ ] Optimize database queries
- [ ] Profile and optimize hot paths
- [ ] Load test before production launch

---

## Communication Channels

### Agent-to-Gemini Communication

For scenarios requiring cross-model validation:

- [ ] **Task C.1:** Define inter-model message schema
    ```json
    {
      "from": "claude-tutor",
      "to": "gemini-evaluator",
      "type": "evaluation_request",
      "payload": {
        "student_query": "...",
        "tutor_response": "...",
        "context": {...}
      },
      "timestamp": "ISO-8601"
    }
    ```
- [ ] **Task C.2:** Implement Gemini API integration endpoint
- [ ] **Task C.3:** Create request/response logging
- [ ] **Task C.4:** Add timeout and fallback handling

### Agent-to-Human Communication

For escalation and feedback:

- [ ] **Task C.5:** Implement flagging system
    - Trigger when: Confidence < 70%, frustration detected, repeated failures
- [ ] **Task C.6:** Create daily digest of flagged conversations
- [ ] **Task C.7:** Set up Slack/Discord webhook for critical alerts
- [ ] **Task C.8:** Build admin dashboard for conversation review

---

## Appendix: File Checklist

All files that should exist after full implementation:

```
ai-tutor-mvp/
├── app/                              # Next.js Frontend
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       └── chat/
│           └── route.ts              # Proxies to Python backend
│
├── components/                       # React Components
│   ├── AutomataCanvas.tsx
│   ├── ChatInterface.tsx
│   ├── SelfLoopEdge.tsx
│   ├── ProblemDisplay.tsx
│   └── UserInputPanel.tsx
│
├── lib/                              # LangChain/LangGraph Core
│   ├── graphs/
│   │   ├── socratic_graph.py
│   │   └── evaluation_graph.py
│   ├── tools/
│   │   ├── wolfram.py
│   │   ├── code_executor.py
│   │   ├── web_search.py
│   │   └── automata_builder.py
│   ├── memory/
│   │   ├── student_state.py
│   │   └── checkpointer.py
│   └── chains/
│       ├── socratic_chain.py
│       └── assessment_chain.py
│
├── server/                           # FastAPI Backend
│   ├── main.py
│   ├── streaming.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── agents/                           # Google ADK Structure
│   ├── __init__.py
│   ├── loader.py
│   ├── tutors/
│   │   ├── automata_tutor/
│   │   │   ├── agent.py
│   │   │   ├── tools.py
│   │   │   ├── prompts.py
│   │   │   └── agent.test.json
│   │   ├── proof_tutor/
│   │   │   ├── agent.py
│   │   │   ├── tools.py
│   │   │   ├── prompts.py
│   │   │   └── agent.test.json
│   │   └── complexity_tutor/
│   │       ├── agent.py
│   │       ├── tools.py
│   │       ├── prompts.py
│   │       └── agent.test.json
│   └── meta_tutor/
│       ├── agent.py
│       └── agent.test.json
│
├── evaluation/                       # ADK Evaluation Framework
│   ├── test_suites/
│   │   ├── socratic_method.test.json
│   │   ├── accuracy.test.json
│   │   └── pedagogy.test.json
│   ├── evaluator.py
│   └── metrics.py
│
├── docs/                             # Documentation
│   ├── AGENT_FRAMEWORK_ARCHITECTURE.md
│   ├── IMPLEMENTATION_CHECKLIST.md
│   └── IMPLEMENTATION_CHECKLIST_REVISED.md
│
├── .github/
│   └── workflows/
│       └── evaluate.yml              # CI evaluation pipeline
│
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

*Document Version: 2.0*
*Created: December 2025*
*Validated By: APEX Project Manager*
