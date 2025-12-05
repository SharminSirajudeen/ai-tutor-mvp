from typing import TypedDict, Annotated, Literal, List, Dict

class StudentState(TypedDict):
    """
    Tracks the student's learning journey and the state of the conversation.
    """
    # Conversation history
    messages: Annotated[List, "Conversation history"]
    
    # Context of the current problem
    problem_context: str
    
    # State of the visual canvas (e.g., ReactFlow nodes and edges)
    canvas_state: Dict
    
    # Commands for the frontend to draw/update the canvas
    draw_commands: List
    
    # AI's assessment of the student's understanding
    understanding_level: Literal["confused", "progressing", "mastered"]
    
    # Number of attempts the student has made on the current concept
    attempts: int
    
    # The current topic being discussed
    topic: str
    
    # Student's mastery scores for different topics
    mastery_scores: Dict[str, float]  # e.g., {"DFA": 0.8, "NFA": 0.6}
