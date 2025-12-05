"""
Automata Builder Tool

This tool generates ReactFlow-compatible draw commands for visualizing
DFA, NFA, and other automata on the frontend canvas.

Commands are consumed by the AutomataCanvas component.
"""

from typing import List, Dict, Any, Optional
from langchain_core.tools import tool
from pydantic import BaseModel, Field


class State(BaseModel):
    """A state in the automaton."""
    label: str = Field(description="State label (e.g., 'q0', 'q1')")
    is_start: bool = Field(default=False, description="Whether this is the start state")
    is_accept: bool = Field(default=False, description="Whether this is an accepting state")


class Transition(BaseModel):
    """A transition between states."""
    from_state: str = Field(description="Source state label")
    to_state: str = Field(description="Destination state label")
    symbol: str = Field(description="Transition symbol (e.g., 'a', 'b', 'ε')")


class AutomatonSpec(BaseModel):
    """Complete specification of an automaton."""
    states: List[State] = Field(description="List of states in the automaton")
    transitions: List[Transition] = Field(description="List of transitions")
    automaton_type: str = Field(default="DFA", description="Type: DFA, NFA, or PDA")


def generate_draw_commands(spec: AutomatonSpec) -> List[Dict[str, Any]]:
    """
    Convert an automaton specification to ReactFlow draw commands.

    These commands are understood by the AutomataCanvas component
    and will render the automaton visually.

    Args:
        spec: AutomatonSpec containing states and transitions

    Returns:
        List of draw command dictionaries
    """
    commands = []

    # Add states
    for state in spec.states:
        commands.append({
            "type": "addState",
            "label": state.label,
            "isStart": state.is_start,
            "isAccept": state.is_accept,
        })

    # Add transitions
    for trans in spec.transitions:
        commands.append({
            "type": "addTransition",
            "from": trans.from_state,
            "to": trans.to_state,
            "symbol": trans.symbol,
        })

    return commands


def create_dfa_for_pattern(pattern: str) -> List[Dict[str, Any]]:
    """
    Create draw commands for common DFA patterns.

    Supports patterns like:
    - "ends_with_ab": Strings ending in 'ab'
    - "contains_ab": Strings containing 'ab'
    - "even_a": Even number of 'a's
    - "starts_with_a": Strings starting with 'a'

    Args:
        pattern: Name of the pattern

    Returns:
        List of draw commands for the DFA
    """
    patterns = {
        "ends_with_ab": AutomatonSpec(
            states=[
                State(label="q0", is_start=True, is_accept=False),
                State(label="q1", is_start=False, is_accept=False),
                State(label="q2", is_start=False, is_accept=True),
            ],
            transitions=[
                Transition(from_state="q0", to_state="q0", symbol="b"),
                Transition(from_state="q0", to_state="q1", symbol="a"),
                Transition(from_state="q1", to_state="q1", symbol="a"),
                Transition(from_state="q1", to_state="q2", symbol="b"),
                Transition(from_state="q2", to_state="q0", symbol="b"),
                Transition(from_state="q2", to_state="q1", symbol="a"),
            ],
            automaton_type="DFA"
        ),
        "even_a": AutomatonSpec(
            states=[
                State(label="q0", is_start=True, is_accept=True),
                State(label="q1", is_start=False, is_accept=False),
            ],
            transitions=[
                Transition(from_state="q0", to_state="q1", symbol="a"),
                Transition(from_state="q0", to_state="q0", symbol="b"),
                Transition(from_state="q1", to_state="q0", symbol="a"),
                Transition(from_state="q1", to_state="q1", symbol="b"),
            ],
            automaton_type="DFA"
        ),
        "starts_with_a": AutomatonSpec(
            states=[
                State(label="q0", is_start=True, is_accept=False),
                State(label="q1", is_start=False, is_accept=True),
                State(label="q2", is_start=False, is_accept=False),
            ],
            transitions=[
                Transition(from_state="q0", to_state="q1", symbol="a"),
                Transition(from_state="q0", to_state="q2", symbol="b"),
                Transition(from_state="q1", to_state="q1", symbol="a"),
                Transition(from_state="q1", to_state="q1", symbol="b"),
                Transition(from_state="q2", to_state="q2", symbol="a"),
                Transition(from_state="q2", to_state="q2", symbol="b"),
            ],
            automaton_type="DFA"
        ),
    }

    if pattern in patterns:
        return generate_draw_commands(patterns[pattern])

    return []


@tool
def automata_builder_tool(
    states: List[Dict[str, Any]],
    transitions: List[Dict[str, Any]],
    automaton_type: str = "DFA"
) -> Dict[str, Any]:
    """
    Build an automaton visualization from states and transitions.

    Use this tool when you need to draw a DFA, NFA, or other automaton
    on the visual canvas. The tool generates commands that the frontend
    will use to render the automaton.

    Args:
        states: List of state definitions. Each state should have:
            - label: string (e.g., "q0", "q1")
            - is_start: boolean (only one state should be start)
            - is_accept: boolean (can have multiple accepting states)
        transitions: List of transition definitions. Each transition has:
            - from_state: string (source state label)
            - to_state: string (destination state label)
            - symbol: string (transition symbol, use "ε" for epsilon)
        automaton_type: "DFA", "NFA", or "PDA"

    Returns:
        Dictionary with draw_commands list for the frontend

    Example:
        >>> automata_builder_tool(
        ...     states=[
        ...         {"label": "q0", "is_start": True, "is_accept": False},
        ...         {"label": "q1", "is_start": False, "is_accept": True}
        ...     ],
        ...     transitions=[
        ...         {"from_state": "q0", "to_state": "q1", "symbol": "a"}
        ...     ]
        ... )
    """
    # Convert input dicts to Pydantic models
    state_models = [
        State(
            label=s["label"],
            is_start=s.get("is_start", False),
            is_accept=s.get("is_accept", False)
        )
        for s in states
    ]

    transition_models = [
        Transition(
            from_state=t["from_state"],
            to_state=t["to_state"],
            symbol=t["symbol"]
        )
        for t in transitions
    ]

    spec = AutomatonSpec(
        states=state_models,
        transitions=transition_models,
        automaton_type=automaton_type
    )

    draw_commands = generate_draw_commands(spec)

    return {
        "success": True,
        "automaton_type": automaton_type,
        "state_count": len(states),
        "transition_count": len(transitions),
        "draw_commands": draw_commands
    }


@tool
def draw_common_dfa(pattern_name: str) -> Dict[str, Any]:
    """
    Draw a common DFA pattern on the canvas.

    Use this for quickly demonstrating standard DFA examples
    without specifying all states and transitions manually.

    Args:
        pattern_name: Name of the pattern. Supported patterns:
            - "ends_with_ab": DFA accepting strings ending in 'ab'
            - "even_a": DFA accepting strings with even number of 'a's
            - "starts_with_a": DFA accepting strings starting with 'a'

    Returns:
        Dictionary with draw_commands for the pattern
    """
    commands = create_dfa_for_pattern(pattern_name)

    if not commands:
        return {
            "success": False,
            "error": f"Unknown pattern: {pattern_name}",
            "available_patterns": ["ends_with_ab", "even_a", "starts_with_a"]
        }

    return {
        "success": True,
        "pattern": pattern_name,
        "draw_commands": commands
    }


# Export tools list for binding to LLM
AUTOMATA_TOOLS = [automata_builder_tool, draw_common_dfa]
