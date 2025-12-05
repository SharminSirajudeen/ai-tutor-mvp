"""
Server-Sent Events (SSE) Streaming for LangGraph

Provides real-time streaming of agent responses to the frontend.
This creates a ChatGPT-like experience where users see the AI typing.

Budget: Free (uses FastAPI's built-in StreamingResponse)
"""

import json
import asyncio
from typing import AsyncIterator, Dict, Any, Optional
from fastapi import Request
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage


async def stream_graph_updates(
    graph,
    initial_state: Dict[str, Any],
    config: Dict[str, Any],
    request: Optional[Request] = None
) -> AsyncIterator[str]:
    """
    Stream updates from a LangGraph execution.

    Yields Server-Sent Events (SSE) formatted messages as the graph runs.
    Each event contains the current state, including partial AI responses.

    Args:
        graph: Compiled LangGraph instance
        initial_state: Initial state dict for the graph
        config: LangGraph config (must include thread_id)
        request: Optional FastAPI request (for disconnect detection)

    Yields:
        SSE-formatted strings: "data: {json}\\n\\n"

    Example:
        async for chunk in stream_graph_updates(graph, state, config):
            yield chunk
    """
    try:
        # Stream the graph execution
        async for event in graph.astream(initial_state, config, stream_mode="updates"):
            # Check if client disconnected
            if request and await request.is_disconnected():
                print("Client disconnected, stopping stream")
                break

            # Extract the update data
            # LangGraph stream events have format: {node_name: node_output}
            for node_name, node_output in event.items():
                # Format as SSE event
                event_data = {
                    "type": "node_update",
                    "node": node_name,
                    "data": serialize_state(node_output)
                }

                yield f"data: {json.dumps(event_data)}\n\n"

                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.01)

        # Send completion event
        final_event = {
            "type": "done",
            "message": "Stream completed successfully"
        }
        yield f"data: {json.dumps(final_event)}\n\n"

    except asyncio.CancelledError:
        print("Stream cancelled by client")
        yield f"data: {json.dumps({'type': 'error', 'message': 'Stream cancelled'})}\n\n"
    except Exception as e:
        print(f"Error during streaming: {e}")
        error_event = {
            "type": "error",
            "message": str(e)
        }
        yield f"data: {json.dumps(error_event)}\n\n"


async def stream_graph_messages(
    graph,
    initial_state: Dict[str, Any],
    config: Dict[str, Any],
    request: Optional[Request] = None
) -> AsyncIterator[str]:
    """
    Stream only the AI messages from graph execution.

    This provides a cleaner interface for chat UIs that just want
    the text content, not the full state updates.

    Args:
        graph: Compiled LangGraph instance
        initial_state: Initial state dict for the graph
        config: LangGraph config (must include thread_id)
        request: Optional FastAPI request (for disconnect detection)

    Yields:
        SSE-formatted strings with AI message chunks
    """
    try:
        # Track the last message to detect new content
        last_message_count = len(initial_state.get("messages", []))

        async for event in graph.astream(initial_state, config, stream_mode="updates"):
            # Check if client disconnected
            if request and await request.is_disconnected():
                break

            # Look for new messages in the state
            for node_name, node_output in event.items():
                messages = node_output.get("messages", [])

                # Check if new messages were added
                if len(messages) > last_message_count:
                    new_messages = messages[last_message_count:]

                    for msg in new_messages:
                        if isinstance(msg, AIMessage):
                            # Stream the AI message content
                            event_data = {
                                "type": "message",
                                "content": msg.content,
                                "node": node_name
                            }
                            yield f"data: {json.dumps(event_data)}\n\n"

                    last_message_count = len(messages)

            await asyncio.sleep(0.01)

        # Send completion
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        print(f"Error streaming messages: {e}")
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


async def stream_with_draw_commands(
    graph,
    initial_state: Dict[str, Any],
    config: Dict[str, Any],
    request: Optional[Request] = None
) -> AsyncIterator[str]:
    """
    Stream graph updates with special handling for draw_commands.

    This is optimized for the AI Tutor use case where we need to send
    both the AI's text response AND visual canvas updates.

    Args:
        graph: Compiled LangGraph instance
        initial_state: Initial state dict
        config: LangGraph config
        request: Optional FastAPI request

    Yields:
        SSE events with messages and draw_commands separated
    """
    try:
        async for event in graph.astream(initial_state, config, stream_mode="updates"):
            if request and await request.is_disconnected():
                break

            for node_name, node_output in event.items():
                # Handle messages
                if "messages" in node_output:
                    messages = node_output["messages"]
                    if messages and isinstance(messages[-1], AIMessage):
                        yield f"data: {json.dumps({'type': 'message', 'content': messages[-1].content})}\n\n"

                # Handle draw commands
                if "draw_commands" in node_output:
                    commands = node_output["draw_commands"]
                    if commands:
                        yield f"data: {json.dumps({'type': 'draw_commands', 'commands': commands})}\n\n"

                # Handle understanding level updates
                if "understanding_level" in node_output:
                    yield f"data: {json.dumps({'type': 'understanding_update', 'level': node_output['understanding_level']})}\n\n"

            await asyncio.sleep(0.01)

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        print(f"Error in streaming: {e}")
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


def serialize_state(state: Any) -> Any:
    """
    Serialize LangChain/LangGraph state objects to JSON-compatible format.

    Handles special types like BaseMessage, etc.

    Args:
        state: State object to serialize

    Returns:
        JSON-serializable version of the state
    """
    if isinstance(state, dict):
        return {k: serialize_state(v) for k, v in state.items()}
    elif isinstance(state, list):
        return [serialize_state(item) for item in state]
    elif isinstance(state, BaseMessage):
        return {
            "type": state.__class__.__name__,
            "content": state.content,
        }
    elif hasattr(state, "__dict__"):
        # Handle custom objects with __dict__
        return serialize_state(state.__dict__)
    else:
        # Primitive types
        return state


def create_sse_response(stream_generator: AsyncIterator[str]) -> StreamingResponse:
    """
    Create a FastAPI StreamingResponse for SSE.

    Args:
        stream_generator: Async generator yielding SSE-formatted strings

    Returns:
        FastAPI StreamingResponse configured for SSE
    """
    return StreamingResponse(
        stream_generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )


# Convenience function for the most common use case
async def stream_socratic_tutor(
    graph,
    message: str,
    session_id: str,
    problem_context: str = "",
    canvas_state: Optional[Dict] = None,
    request: Optional[Request] = None
) -> AsyncIterator[str]:
    """
    High-level streaming function for the Socratic tutor.

    Args:
        graph: Socratic tutor graph instance
        message: Student's message
        session_id: Session/thread ID
        problem_context: Context about the current problem
        canvas_state: Current state of the visual canvas
        request: FastAPI request for disconnect detection

    Yields:
        SSE-formatted events
    """
    config = {"configurable": {"thread_id": session_id}}

    initial_state = {
        "messages": [HumanMessage(content=message)],
        "problem_context": problem_context,
        "canvas_state": canvas_state or {},
        "draw_commands": [],
        "understanding_level": "confused",
        "attempts": 1,
        "topic": "DFA",
        "mastery_scores": {},
    }

    async for chunk in stream_with_draw_commands(graph, initial_state, config, request):
        yield chunk
