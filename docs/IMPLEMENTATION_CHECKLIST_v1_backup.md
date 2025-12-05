# AI Tutor MVP: Implementation Checklist

**Objective:** This document outlines the specific tasks required to implement the architecture defined in `AGENT_FRAMEWORK_ARCHITECTURE.md`. It is intended to be used for validation, tracking, and delegation.

**Instructions for Reviewer:** Please review this checklist against the `AGENT_FRAMEWORK_ARCHITECTURE.md` document. Verify that the tasks listed here accurately and completely represent the "Implementation Roadmap" and "Proposed Architecture" sections of that document. Please flag any discrepancies, missing steps, or misinterpretations.

---

### Phase 1: LangChain Foundation (Status: In Progress)

-   [x] **Task 1.1:** Set up Python backend environment in `ai-tutor-mvp/server/`.
    -   [x] Create `server/` directory.
    -   [x] Create `server/requirements.txt` with initial dependencies.
-   [x] **Task 1.2:** Implement basic FastAPI server in `server/main.py`.
    -   [x] Create a health-check endpoint.
-   [x] **Task 1.3:** Create initial LangGraph agent structure.
    -   [x] Create directory structure: `server/lib/graphs`, `server/lib/tools`, `server/lib/memory`.
    -   [x] Define `StudentState` in `server/lib/memory/student_state.py`.
    -   [x] Create skeleton `socratic_graph.py` with `StateGraph` and `MemorySaver`.
-   [x] **Task 1.4:** Connect Next.js frontend to the new Python backend.
    -   [x] Integrate the `socratic_tutor` agent into `server/main.py` with a `/api/v1/chat` endpoint.
    -   [x] Modify `ai-tutor-mvp/app/api/chat/route.ts` to call the new backend endpoint.
-   [ ] **Task 1.5:** End-to-end system test.
    -   [ ] Create `.env` file in `server/` with `GROQ_API_KEY`.
    -   [ ] Install Python dependencies and run FastAPI server.
    -   [ ] Install npm dependencies and run Next.js server.
    -   [ ] Verify chat functionality in the browser at `http://localhost:3000`.

### Phase 2: LangGraph State Machine (Status: Pending)

-   [ ] **Task 2.1:** Implement `assess_understanding` node in `socratic_graph.py`.
-   [ ] **Task 2.2:** Implement `socratic_question` and `provide_hint` nodes.
-   [ ] **Task 2.3:** Implement `route_by_understanding` conditional routing logic in the LangGraph.
-   [ ] **Task 2.4:** Persist `mastery_scores` and `understanding_level` in the `StudentState` across requests.
-   [ ] **Task 2.5:** Write unit tests for the new graph logic.

### Phase 3: ADK Quality Shell (Status: Pending)

-   [ ] **Task 3.1:** Set up ADK project structure (`agents/`, `evaluation/`) within the `ai-tutor-mvp` project.
-   [ ] **Task 3.2:** Wrap the LangGraph agent in a Google ADK `Agent` class (`agents/tutors/automata_tutor/agent.py`).
-   [ ] **Task 3.3:** Create the initial ADK test suite (`agent.test.json`) with at least 5 test cases for Socratic method and accuracy.
-   [ ] **Task 3.4:** Implement the `AgentEvaluator` runner script (`evaluation/evaluator.py`).
-   [ ] **Task 3.5:** Set up a GitHub Actions workflow to run the evaluation suite on every push to the main branch.

### Phase 4: Tool Expansion (Status: Pending)

-   [ ] **Task 4.1:** Implement and integrate the WolframAlpha tool for mathematical problem-solving.
-   [ ] **Task 4.2:** Implement and integrate a secure Python REPL tool for code execution and explanation.
-   [ ] **Task 4.3:** Implement and integrate a web search tool (e.g., Tavily or DuckDuckGo) for fetching definitions and examples.
-   [ ] **Task 4.4:** Expand the ADK test suite to cover all new tool functionalities, ensuring they are used correctly.

### Phase 5: Multi-Agent Specialists (Status: Pending)

-   [ ] **Task 5.1:** Create the agent skeletons for `proof_tutor` and `complexity_tutor`.
-   [ ] **Task 5.2:** Implement the `meta_tutor` LangGraph supervisor to correctly route tasks to the specialist agents.
-   [ ] **Task 5.3:** Update the ADK evaluation suite to test the routing accuracy of the `meta_tutor`.

### Phase 6: Production (Status: Pending)

-   [ ] **Task 6.1:** Configure LangGraph to use a persistent checkpointer (e.g., PostgreSQL or Redis) instead of `MemorySaver`.
-   [ ] **Task 6.2:** Integrate LangSmith for production-grade observability, tracing, and debugging.
-   [ ] **Task 6.3:** Research and select a cost-effective GPU cloud provider for hosting containerized services.
-   [ ] **Task 6.4:** Create production-ready deployment scripts (e.g., using Terraform or modifying `docker-compose.deploy.yml`).
-   [ ] **Task 6.5:** Deploy the `ai-tutor-mvp` frontend to Vercel and the Python backend to the chosen cloud provider.
