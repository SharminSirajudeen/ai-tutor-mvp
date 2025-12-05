"""
Socratic Tutor Graph

This is the main LangGraph workflow for the AI Tutor.
It implements the Socratic teaching method using a state machine approach.

Flow:
1. Assess student's understanding level
2. Generate Socratic question or guidance
3. Check if tools need to be called (e.g., draw automata)
4. Update understanding level based on response
5. Continue teaching loop
"""

import os
import json
from typing import Literal
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import AIMessage, ToolMessage

from ..memory.student_state import StudentState
from ..memory.checkpointer import get_default_checkpointer
from ..tools.automata_builder import AUTOMATA_TOOLS
from ..chains.socratic_chain import create_socratic_chain


# Initialize the LLM with Groq LLaMA 3.3 70B
# Using llama-3.3-70b-versatile as specified in requirements
# Default to placeholder if API key not set (will fail at runtime if used)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "placeholder-key-not-set")

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.7,
    api_key=GROQ_API_KEY,
    streaming=True  # Enable streaming for real-time responses
)

# Bind tools to the LLM
# This allows the LLM to call automata_builder_tool and draw_common_dfa
llm_with_tools = llm.bind_tools(AUTOMATA_TOOLS)


# Define graph nodes

def assess_understanding(state: StudentState) -> StudentState:
    """
    Assess the student's understanding based on their message.

    This is a simple heuristic-based assessment. In production,
    you might use a separate LLM call or ML model.
    """
    messages = state["messages"]
    if not messages:
        return state

    last_message = messages[-1].content.lower()

    # Simple keyword-based assessment
    confused_indicators = ["help", "don't understand", "confused", "what", "?"]
    mastery_indicators = ["got it", "understand", "makes sense", "i see", "correct"]

    if any(word in last_message for word in confused_indicators):
        state["understanding_level"] = "confused"
    elif any(word in last_message for word in mastery_indicators):
        state["understanding_level"] = "mastered"
    else:
        state["understanding_level"] = "progressing"

    return state


def socratic_question(state: StudentState) -> StudentState:
    """
    Generate a Socratic question or guidance using the LLM.

    This node uses the LLM with tools to generate appropriate responses
    and potentially call tools to draw automata.
    """
    # Create the Socratic chain with context
    chain_input = {
        "messages": state["messages"],
        "topic": state["topic"],
        "understanding_level": state["understanding_level"],
        "attempts": state["attempts"],
        "problem_context": state["problem_context"],
    }

    # Invoke the LLM with tools
    response = llm_with_tools.invoke(state["messages"])

    # Add AI message to state
    state["messages"].append(response)

    return state


def execute_tools(state: StudentState) -> StudentState:
    """
    Execute any tools that the LLM requested.

    This node is only called if the LLM decided to use tools.
    Manually executes tool calls since ToolNode is not available.
    """
    messages = state["messages"]
    last_message = messages[-1]

    # Check if the last message has tool calls
    if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
        return state

    # Create a dict of tools by name for easy lookup
    tools_by_name = {tool.name: tool for tool in AUTOMATA_TOOLS}

    # Execute each tool call
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]

        if tool_name in tools_by_name:
            tool = tools_by_name[tool_name]
            try:
                # Invoke the tool
                result = tool.invoke(tool_args)

                # Parse result and extract draw commands
                if isinstance(result, dict) and "draw_commands" in result:
                    state["draw_commands"].extend(result["draw_commands"])

                # Create ToolMessage
                tool_message = ToolMessage(
                    content=json.dumps(result) if isinstance(result, dict) else str(result),
                    tool_call_id=tool_call.get("id", ""),
                    name=tool_name
                )
                state["messages"].append(tool_message)

            except Exception as e:
                # Create error ToolMessage
                error_message = ToolMessage(
                    content=json.dumps({"error": str(e)}),
                    tool_call_id=tool_call.get("id", ""),
                    name=tool_name
                )
                state["messages"].append(error_message)

    return state


def should_use_tools(state: StudentState) -> Literal["tools", "end"]:
    """
    Determine if we should execute tools or end the turn.

    Routes to:
    - "tools": If the LLM requested tool calls
    - "end": If no tools needed, finish this turn
    """
    messages = state["messages"]
    if not messages:
        return "end"

    last_message = messages[-1]

    # Check if last message has tool calls
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"

    return "end"


def update_attempts(state: StudentState) -> StudentState:
    """
    Update the attempt counter for the current concept.
    """
    state["attempts"] = state.get("attempts", 0) + 1
    return state


# Build the graph
workflow = StateGraph(StudentState)

# Add nodes
workflow.add_node("assess", assess_understanding)
workflow.add_node("socratic", socratic_question)
workflow.add_node("tools", execute_tools)
workflow.add_node("update_attempts", update_attempts)

# Set entry point
workflow.set_entry_point("assess")

# Add edges
workflow.add_edge("assess", "socratic")

# Conditional edge: if tools needed, execute them, otherwise end
workflow.add_conditional_edges(
    "socratic",
    should_use_tools,
    {
        "tools": "tools",
        "end": "update_attempts"
    }
)

# After tools, go to update attempts
workflow.add_edge("tools", "update_attempts")

# After updating attempts, end this turn
workflow.add_edge("update_attempts", END)

# Compile the graph with checkpointer
checkpointer = get_default_checkpointer()
socratic_tutor = workflow.compile(checkpointer=checkpointer)

print("✓ Socratic Tutor graph compiled successfully with tools and memory")
