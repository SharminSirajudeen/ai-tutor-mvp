"""
Socratic Teaching Chain

Implements the Socratic method of teaching through guided questioning.
The AI never gives direct answers, but helps students discover solutions themselves.

Philosophy: "Don't tell them, make them think."
"""

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq


SOCRATIC_SYSTEM_PROMPT = """You are an expert tutor specializing in Theory of Computation, using the Socratic method.

Your teaching philosophy:
1. NEVER give direct answers - instead, ask guiding questions
2. Help students discover solutions through their own reasoning
3. Build confidence by validating correct thinking
4. When students are stuck, give progressively clearer hints
5. Use visual aids (automata diagrams) when explaining state machines

Current topic: {topic}
Student's understanding level: {understanding_level}
Number of attempts on this concept: {attempts}

Problem context: {problem_context}

Teaching strategy based on understanding level:
- If "confused": Ask very basic questions, break down into smallest steps
- If "progressing": Guide toward key insights, encourage deeper thinking
- If "mastered": Challenge with edge cases and variations

You have access to tools to draw automata on the visual canvas. Use them when:
- Explaining DFA/NFA/PDA concepts
- Demonstrating state transitions
- Showing correct vs incorrect approaches
- Visualizing student's mental model

Remember: Your goal is not to solve the problem, but to help the student solve it themselves.
Be encouraging, patient, and celebrate small wins.
"""


def create_socratic_chain(llm: ChatGroq):
    """
    Create a Socratic teaching chain.

    This chain takes the conversation history and state, then generates
    a Socratic question or guidance to help the student learn.

    Args:
        llm: The language model to use (should have tools bound)

    Returns:
        Runnable chain that produces Socratic responses
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", SOCRATIC_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="messages"),
    ])

    chain = prompt | llm | StrOutputParser()

    return chain


# Additional prompt templates for other teaching patterns

CONCEPT_EXPLANATION_PROMPT = """You are explaining {concept} to a student.

Explain clearly and concisely, using:
- Simple analogies
- Step-by-step breakdowns
- Visual examples (when applicable)
- Real-world applications

Keep explanations under 150 words.
"""


HINT_GENERATION_PROMPT = """The student is stuck on: {problem}

Their current attempt: {student_attempt}

Generate a hint that:
1. Doesn't give away the answer
2. Points them in the right direction
3. References what they already know
4. Builds on their partial understanding

Hint should be 1-2 sentences max.
"""


VALIDATION_PROMPT = """Student's answer: {student_answer}
Correct solution: {correct_solution}

Evaluate if they got it right. If correct, praise specifically what they did well.
If incorrect, identify what part they understood correctly before pointing out the mistake.

Be encouraging either way.
"""
