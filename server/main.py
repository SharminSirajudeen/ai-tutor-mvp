"""
AI Tutor Backend API

FastAPI server providing endpoints for the Socratic AI Tutor.
Supports both standard request/response and Server-Sent Events (SSE) streaming.

Endpoints:
- GET /: Health check
- POST /api/v1/chat: Standard chat (request/response)
- POST /api/v1/chat/stream: Streaming chat (SSE)
"""

import os
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain_core.messages import HumanMessage, AIMessage

from lib.graphs.socratic_graph import socratic_tutor
from streaming import stream_socratic_tutor, create_sse_response

# Load environment variables
load_dotenv()

# Validate required environment variables
if not os.environ.get("GROQ_API_KEY"):
    print("WARNING: GROQ_API_KEY not found in environment variables")
    print("Set it in .env file or environment")

app = FastAPI(
    title="AI Tutor Backend",
    version="0.1.0",
    description="Backend server for the AI Tutor MVP, powered by LangGraph and Groq.",
)

# Configure CORS
# For production, restrict to your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models

class ChatRequest(BaseModel):
    """Request model for chat endpoints."""
    message: str = Field(..., description="Student's message/question")
    session_id: str = Field(default="default_session", description="Session identifier for conversation continuity")
    problem_context: Optional[str] = Field(default="", description="Context about the current problem being discussed")
    canvas_state: Optional[Dict[str, Any]] = Field(default=None, description="Current state of the visual canvas (ReactFlow nodes/edges)")
    topic: Optional[str] = Field(default="DFA", description="Current topic (DFA, NFA, PDA, etc.)")


class ChatResponse(BaseModel):
    """Response model for standard chat endpoint."""
    response: str = Field(..., description="AI tutor's response")
    draw_commands: list = Field(default=[], description="Commands for updating the visual canvas")
    understanding_level: str = Field(default="confused", description="Assessed understanding level")
    session_id: str = Field(..., description="Session identifier")


# Endpoints

@app.get("/", tags=["Health Check"])
async def root():
    """
    Health check endpoint.

    Returns:
        Status message and configuration info
    """
    return {
        "status": "ok",
        "message": "AI Tutor Backend is running",
        "version": "0.1.0",
        "groq_configured": bool(os.environ.get("GROQ_API_KEY")),
        "endpoints": {
            "chat": "/api/v1/chat",
            "stream": "/api/v1/chat/stream"
        }
    }


@app.post("/api/v1/chat", response_model=ChatResponse, tags=["AI Tutor"])
async def chat_with_tutor(request: ChatRequest):
    """
    Standard chat endpoint (request/response).

    Processes the student's message and returns the complete response
    after the AI has finished thinking.

    Use this for simpler integrations or when streaming is not needed.

    Args:
        request: ChatRequest with message and context

    Returns:
        ChatResponse with AI's response and any draw commands
    """
    # Configure LangGraph with session/thread ID
    config = {"configurable": {"thread_id": request.session_id}}

    # Prepare initial state
    initial_state = {
        "messages": [HumanMessage(content=request.message)],
        "problem_context": request.problem_context or "",
        "canvas_state": request.canvas_state or {},
        "draw_commands": [],
        "understanding_level": "confused",
        "attempts": 1,
        "topic": request.topic or "DFA",
        "mastery_scores": {},
    }

    # Invoke the graph and wait for completion
    response_state = await socratic_tutor.ainvoke(initial_state, config)

    # Extract the AI's response
    ai_message = response_state["messages"][-1]

    # Return structured response
    return ChatResponse(
        response=ai_message.content if isinstance(ai_message, AIMessage) else str(ai_message),
        draw_commands=response_state.get("draw_commands", []),
        understanding_level=response_state.get("understanding_level", "confused"),
        session_id=request.session_id
    )


@app.post("/api/v1/chat/stream", tags=["AI Tutor"])
async def stream_chat_with_tutor(request_obj: Request, chat_request: ChatRequest):
    """
    Streaming chat endpoint (Server-Sent Events).

    Streams the AI's response as it's being generated, providing a
    ChatGPT-like experience where users see the AI "typing" in real-time.

    Also streams draw commands and understanding updates as they happen.

    The frontend should connect with EventSource or similar SSE client.

    Event types:
    - "message": AI text content chunks
    - "draw_commands": Canvas update commands
    - "understanding_update": Student understanding level changes
    - "done": Stream completed
    - "error": Error occurred

    Args:
        request_obj: FastAPI request object (for disconnect detection)
        chat_request: ChatRequest with message and context

    Returns:
        StreamingResponse with SSE events
    """
    # Create async generator for streaming
    stream_generator = stream_socratic_tutor(
        graph=socratic_tutor,
        message=chat_request.message,
        session_id=chat_request.session_id,
        problem_context=chat_request.problem_context or "",
        canvas_state=chat_request.canvas_state,
        request=request_obj
    )

    # Return SSE response
    return create_sse_response(stream_generator)


# Development server
if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("AI Tutor Backend Server")
    print("=" * 60)
    print(f"Environment: {'Production' if os.environ.get('ENV') == 'production' else 'Development'}")
    print(f"Groq API Key: {'✓ Configured' if os.environ.get('GROQ_API_KEY') else '✗ Missing'}")
    print("=" * 60)
    print("\nStarting server on http://0.0.0.0:8000")
    print("API docs available at http://0.0.0.0:8000/docs")
    print("\nPress CTRL+C to stop\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
